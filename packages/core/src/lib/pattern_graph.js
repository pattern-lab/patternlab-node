'use strict';

const graphlib = require('graphlib');
const Graph = graphlib.Graph;
const path = require('path');
const fs = require('fs-extra');
const Pattern = require('./object_factory').Pattern;
const CompileState = require('./object_factory').CompileState;
const PatternGraphDot = require('./pattern_graph_dot');
const PatternRegistry = require('./pattern_registry');

/**
 * The most recent version of the pattern graph. This is used to rebuild the graph when
 * the version of a serialized graph does not match the current version.
 * @type {number}
 */
const PATTERN_GRAPH_VERSION = 1;

/**
 * Wrapper around a graph library to build a dependency graph of patterns.
 * Each node in the graph will maintain a {@link CompileState}. This allows finding all
 * changed patterns and their transitive dependencies.
 *
 * Internally the graph maintains a {@link PatternRegistry} to allow fast lookups of the patterns.
 *
 * @constructor Constructs a new PatternGraph from a JSON-style JavaScript object or an empty graph
 * if no argument is given.
 *
 * @param {Graph} graph  The graphlib graph object
 * @param {int} timestamp The unix timestamp
 * @param {int} version The graph version.
 *
 * @returns {{PatternGraph: PatternGraph}}

 * @see PatternGraph#fromJson
 * @see <a href="https://github.com/pattern-lab/patternlab-node/issues/540">#540</a>
 */
const PatternGraph = function (graph, timestamp, version) {
  this.graph =
    graph ||
    new Graph({
      directed: true,
    });
  this.graph.setDefaultEdgeLabel({});

  // Allows faster lookups for patterns by name for each element in the graph
  // The idea here is to make a pattern known to the graph as soon as it exists
  this.patterns = new PatternRegistry();
  this.timestamp = timestamp || new Date().getTime();
  this.version = version || PATTERN_GRAPH_VERSION;
};

// shorthand. Use relPath as it is always unique, even with subPatternGroup
const nodeName = (p) => (p instanceof Pattern ? p.relPath : p);

PatternGraph.prototype = {
  /**
   * Synchronizes the graph nodes with the set of all known patterns.
   * For instance when a pattern is deleted or moved, it might still have a node from the serialized
   * JSON, but there is no source pattern.
   *
   * @see {@link https://github.com/pattern-lab/patternlab-node/issues/580|Issue #580}
   */
  sync: function () {
    // Remove any patterns that are in the graph data, but that haven't been discovered when
    // walking all patterns iteratively
    const nodesToRemove = this.nodes().filter((n) => !this.patterns.has(n));
    nodesToRemove.forEach((n) => this.remove(n));
    return nodesToRemove;
  },

  /**
   * Creates an independent copy of the graph where nodes and edges can be modified without
   * affecting the source.
   */
  clone: function () {
    const json = graphlib.json.write(this.graph);
    const graph = graphlib.json.read(json);
    return new PatternGraph(graph, this.timestamp, this.version);
  },

  /**
   * Add a pattern to the graph and copy its {@link Pattern.compileState} to the node's data.
   * If the pattern is already known, nothing is done.
   *
   * @param {Pattern} pattern
   */
  add: function (pattern) {
    const n = nodeName(pattern);
    if (!this.patterns.has(n)) {
      this.graph.setNode(n, {
        compileState: pattern.compileState,
      });

      this.patterns.put(pattern);
    }
  },

  remove: function (pattern) {
    const n = nodeName(pattern);
    this.graph.removeNode(n);
    this.patterns.remove(n);
  },

  /**
   * Removes nodes from this graph for which the given predicate function returns false.
   * @param {function} fn which takes a node name as argument
   */
  filter: function (fn) {
    this.graph.nodes().forEach((n) => {
      if (!fn(n)) {
        this.remove(n);
      }
    });
  },

  /**
   * Creates a directed edge in the graph which indicates pattern inclusion.
   * Patterns must be {@link PatternGraph.add added} before using this method.
   *
   * @param {Pattern} patternFrom The pattern (subject) which includes the other pattern
   * @param {Pattern} patternTo The pattern (object) that is included by the subject.
   *
   * @throws {Error} If the pattern is unknown
   */
  link: function (patternFrom, patternTo) {
    const nameFrom = nodeName(patternFrom);
    const nameTo = nodeName(patternTo);
    for (const name of [nameFrom, nameTo]) {
      if (!this.patterns.has(name)) {
        throw new Error('Pattern not known: ' + name);
      }
    }
    this.graph.setEdge(nameFrom, nameTo);
  },

  /**
   * Determines if there is one pattern is included by another.
   * @param {Pattern} patternFrom
   * @param {Pattern} patternTo
   *
   * @return {boolean}
   */
  hasLink: function (patternFrom, patternTo) {
    const nameFrom = nodeName(patternFrom);
    const nameTo = nodeName(patternTo);
    return this.graph.hasEdge(nameFrom, nameTo);
  },

  /**
   * Determines the order in which all changed patterns and there transitive predecessors must
   * be rebuild.
   *
   * This first finds all patterns that must be rebuilt, second marks any patterns that transitively
   * include these patterns for rebuilding and finally applies topological sorting to the graph.
   *
   * @return {Array} An Array of {@link Pattern}s in the order by which the changed patters must be
   * compiled.
   */
  compileOrder: function () {
    const compileStateFilter = function (patterns, n) {
      const node = patterns.get(n);
      return node.compileState !== CompileState.CLEAN;
    };

    /**
     * This graph only contains those nodes that need recompilation
     * Edges are added in reverse order for topological sorting(e.g. atom -> molecule -> organism,
     * where "->" means "included by").
     */
    const compileGraph = new Graph({
      directed: true,
    });

    const nodes = this.graph.nodes();
    const changedNodes = nodes.filter((n) =>
      compileStateFilter(this.patterns, n)
    );
    this.nodes2patterns(changedNodes).forEach((pattern) => {
      const patternNode = nodeName(pattern);
      if (!compileGraph.hasNode(patternNode)) {
        compileGraph.setNode(patternNode);
      }
      this.applyReverse(pattern, (from, to) => {
        from.compileState = CompileState.NEEDS_REBUILD;
        const fromName = nodeName(from);
        const toName = nodeName(to);
        for (const name of [fromName, toName]) {
          if (!compileGraph.hasNode(name)) {
            compileGraph.setNode(name);
          }
        }
        if (!compileGraph.hasNode(toName)) {
          compileGraph.setNode(toName);
        }

        // reverse!
        compileGraph.setEdge({ v: toName, w: fromName });
      });
    });

    // Apply topological sorting, Start at the leafs of the graphs (e.g. atoms) and go further
    // up in the hierarchy
    const o = graphlib.alg.topsort(compileGraph);
    return this.nodes2patterns(o);
  },

  /**
   * Given a node and its predecessor, allows exchanging states between nodes.
   * @param pattern
   * @param fn A function that takes the currently viewed pattern and node data. Allows synching data
   * between patterns and node metadata.
   */
  applyReverse: function (pattern, fn) {
    for (const p of this.lineageR(pattern)) {
      fn(p, pattern);
      this.applyReverse(p, fn);
    }
  },

  /**
   * Find the node fro a pattern
   *
   * @param {Pattern} pattern
   *
   * @return [null|Pattern]
   */
  node: function (pattern) {
    return this.graph.node(nodeName(pattern));
  },

  /**
   *
   * @param nodes {Array}
   * @return {Array} An Array of Patterns
   */
  nodes2patterns: function (nodes) {
    return nodes.map((n) => this.patterns.get(n));
  },

  // TODO cache result in a Map[String, Array]?
  // We trade the pattern.lineage array - O(pattern.lineage.length << |V|) - vs. O(|V|) of the graph.
  // As long as no edges are added or removed, we can cache the result in a Map and just return it.
  /**
   * Finds all immediate successors of a pattern, i.e. all patterns which the given pattern includes.
   * @param pattern
   * @return {*|Array}
   */
  lineage: function (pattern) {
    const nodes = this.graph.successors(nodeName(pattern));
    return this.nodes2patterns(nodes);
  },

  /**
   * Returns all patterns that include the given pattern
   * @param {Pattern} pattern
   * @return {*|Array}
   */
  lineageR: function (pattern) {
    const nodes = this.graph.predecessors(nodeName(pattern));
    return this.nodes2patterns(nodes);
  },

  /**
   * Given a {Pattern}, return all partial names of {Pattern} objects included in this the given pattern
   * @param {Pattern} pattern
   *
   * @see {@link PatternGraph.lineage(pattern)}
   */
  lineageIndex: function (pattern) {
    const lineage = this.lineage(pattern);
    return lineage.map((p) => p.patternPartial);
  },

  /**
   * Given a {Pattern}, return all partial names of {Pattern} objects which include the given pattern
   * @param {Pattern} pattern
   *
   * @return {Array}
   *
   * @see {@link PatternGraph.lineageRIndex(pattern)}
   */
  lineageRIndex: function (pattern) {
    const lineageR = this.lineageR(pattern);
    return lineageR.map((p) => p.patternPartial);
  },

  /**
   * Creates an object representing the graph and meta data.
   * @returns {{timestamp: number, graph}}
   */
  toJson: function () {
    return {
      version: this.version,
      timestamp: this.timestamp,
      graph: graphlib.json.write(this.graph),
    };
  },

  /**
   * @return {Array} An array of all node names.
   */
  nodes: function () {
    return this.graph.nodes();
  },

  /**
   * Updates the version to the most recent one
   */
  upgradeVersion: function () {
    this.version = PATTERN_GRAPH_VERSION;
  },
};

/**
 * Creates an empty graph with a unix timestamp of 0 as last compilation date.
 * @param {int} [version=PATTERN_GRAPH_VERSION]
 * @return {PatternGraph}
 */
PatternGraph.empty = function (version) {
  return new PatternGraph(null, 0, version || PATTERN_GRAPH_VERSION);
};

/**
 * Checks if the version of
 * @param {PatternGraph|Object} graphOrJson
 * @return {boolean}
 */
PatternGraph.checkVersion = function (graphOrJson) {
  return graphOrJson.version === PATTERN_GRAPH_VERSION;
};

/**
 * Error that is thrown if the given version does not match the current graph version.
 *
 * @param oldVersion
 * @constructor
 */
function VersionMismatch(oldVersion) {
  this.message = `Version of graph on disk ${oldVersion} != current version ${PATTERN_GRAPH_VERSION}. Please clean your patterns output directory.`;
  this.name = 'VersionMismatch';
}

/**
 * Parse the graph from a JSON object.
 * @param {object} o The JSON object to read from
 * @return {PatternGraph}
 */
PatternGraph.fromJson = function (o) {
  if (!PatternGraph.checkVersion(o)) {
    throw new VersionMismatch(o.version);
  }
  const graph = graphlib.json.read(o.graph);
  return new PatternGraph(graph, o.timestamp, o.version);
};

/**
 * Resolve the path to the file containing the serialized graph
 * @param {string} [filePath='process.cwd()'] Path to the graph file
 * @param {string} [fileName='dependencyGraph.json'] Name of the graph file
 * @return {string}
 */
PatternGraph.resolveJsonGraphFile = function (
  filePath = process.cwd(),
  fileName = 'dependencyGraph.json'
) {
  return path.resolve(filePath, fileName);
};

/**
 * Loads a graph from the file. Does not add any patterns from the patternlab object,
 * i.e. graph.patterns will be still empty until all patterns have been processed.
 *
 * @param {string} [filePath] path to the graph json file
 * @param {string} [fileName] optional name of the graph json file
 *
 * @see {@link PatternGraph.fromJson}
 * @see {@link PatternGraph.resolveJsonGraphFile}
 */
PatternGraph.loadFromFile = function (filePath, fileName) {
  const jsonGraphFile = this.resolveJsonGraphFile(filePath, fileName);

  // File is fresh, so simply construct an empty graph in memory
  if (!fs.existsSync(jsonGraphFile)) {
    return PatternGraph.empty();
  }

  const obj = fs.readJSONSync(jsonGraphFile);
  if (!PatternGraph.checkVersion(obj)) {
    return PatternGraph.empty(obj.version);
  }
  return this.fromJson(obj);
};

/**
 * Serializes the graph to a file.
 * @param patternlab
 * @param {string} [file] For unit testing only.
 *
 * @see {@link PatternGraph.resolveJsonGraphFile}
 */
PatternGraph.storeToFile = function (patternlab) {
  if (process.env.PATTERNLAB_ENV === 'CI') {
    return;
  }
  const jsonGraphFile = this.resolveJsonGraphFile();
  patternlab.graph.timestamp = new Date().getTime();
  fs.writeJSONSync(jsonGraphFile, patternlab.graph.toJson());
};

/**
 * Exports this graph to a GraphViz file.
 * @param patternlab
 @ @param {string} fileName Output filename
 */
PatternGraph.exportToDot = function (patternlab, fileName) {
  const dotFile = this.resolveJsonGraphFile(undefined, fileName);
  const g = PatternGraphDot.generate(patternlab.graph);
  fs.outputFileSync(dotFile, g);
};

module.exports = {
  PatternGraph: PatternGraph,
  PATTERN_GRAPH_VERSION: PATTERN_GRAPH_VERSION,
};
