"use strict";

var graphlib = require('graphlib');
var Graph = graphlib.Graph;
var path = require('path');
var fs = require("fs-extra");
var Pattern = require('./object_factory').Pattern;
var CompileState = require('./object_factory').CompileState;
var PatternGraphDot = require('./pattern_graph_dot');

/**
 * Wrapper around a graph library to build a dependency graph of patterns and
 *
 * @param graph {Graph} The graphlib graph object
 * @param timestamp {int} The unix timestamp
 * @returns {{PatternGraph: PatternGraph}}
 * @constructor Constructs a new PatternGraph from a JSON-style JavaScript object or an empty graph
 * if no argument is given.
 * @see PatternGraph#fromJson
 * @see <a href="https://github.com/pattern-lab/patternlab-node/issues/540">#540</a>
 */
var PatternGraph = function (graph, timestamp) {

  this.graph = graph || new Graph({
    directed: true
  });
  this.graph.setDefaultEdgeLabel({});

  // Allows faster lookups for patterns by name for each element in the graph
  this.patterns = new Map();
  this.timestamp = timestamp || new Date().getTime();
};

// shorthand
var nodeName =
  p => p instanceof Pattern ? p.name : p;

/**
 * Creates an independent copy of the graph where nodes and edges can be modified without
 * affecting the source.
 * @param g {PatternGraph}
 */
function clone(g) {
  var json = graphlib.json.write(g.graph);
  var graph = graphlib.json.read(json);
  return new PatternGraph(graph, new Date(g.timestamp).getTime());
}

PatternGraph.prototype = {
  clone: () => clone(this),

  /**
   *
   * @param pattern {Pattern}
   */
  add: function (pattern) {
    var n = nodeName(pattern);
    if (!this.patterns.has(n)) {
      this.graph.setNode(n, {
        compileState: pattern.compileState
      });
      this.patterns.set(n, pattern);
    }
  },

  remove: function (pattern) {
    var n = nodeName(pattern);
    this.graph.removeNode(n);
    this.patterns.remove(n);
  },

  filter: function (fn) {
    this.graph.nodes().forEach(n => {
      if (!fn(n)) {
        this.remove(n);
      }
    });
  },

  link: function (patternFrom, patternTo) {
    this.add(patternFrom);
    this.add(patternTo);

    let nameFrom = nodeName(patternFrom);
    let nameTo = nodeName(patternTo);
    this.graph.setEdge(nameFrom, nameTo);
  },

  compileOrder: function () {
    var compileStateFilter = function (patterns, n) {
      var node = patterns.get(n);
      return node.compileState !== CompileState.CLEAN;
    };
    // A graph with reveresed edges for topological ordering
    let compileGraph = new Graph({
      directed: true
    });

    let changedNodes = this.graph.nodes().filter(n => compileStateFilter(this.patterns, n));
    this.nodes2patterns(changedNodes).forEach(pattern => {
      let patternNode = nodeName(pattern);
      if (!compileGraph.hasNode(patternNode)) {
        compileGraph.setNode(patternNode);
      }
      this.applyReverse(pattern, (from, to) => {
        // FIXME to.compileState == null for pseudopatterns!
        from.compileState = CompileState.NEEDS_REBUILD;
        let fromName = nodeName(from);
        let toName = nodeName(to);
        for (let nodeName of [fromName, toName]) {
          if (!compileGraph.hasNode(nodeName)) {
            compileGraph.setNode(nodeName);
          }
        }
        if (!compileGraph.hasNode(toName)) {
          compileGraph.setNode(toName);
        }
        // reverse!
        compileGraph.setEdge({v:toName, w:fromName});
      });
    });
    // Apply topological sorting, Start at the leafs of the graphs (e.g. atoms) and go further
    // up in the hierarchy
    var o = graphlib.alg.topsort(compileGraph);
    return this.nodes2patterns(o);
  },

  /**
   * Given a node and its predecessor, allows exchanging states between nodes.
   * @param pattern
   * @param fn A function that takes the currently viewed pattern and node data. Allows synching data
   * between patterns and node metadata.
   */
  applyReverse: function (pattern, fn) {
    for (let p of this.lineageR(pattern)) {
      fn(p, pattern);
      this.applyReverse(p, fn);
    }
  },

  node: function (pattern) {
    return this.graph.node(nodeName(pattern));
  },

  /**
   *
   * @param nodes {Array}
   * @return {Array} An Array of Patterns
   */
  nodes2patterns: function (nodes) {
    return nodes.map(n => this.patterns.get(n));
  },

  // TODO cache result in a Map[String, Array]?
  // We trade the pattern.lineage array - O(pattern.lineage.length << |V|) - vs. O(|V|) of the graph.
  // As long as no edges are added or removed, we can cache the result in a Map and just return it.
  lineage: function (pattern) {
    var nodes = this.graph.successors(nodeName(pattern));
    return this.nodes2patterns(nodes);
  },

  /**
   * Returns all patterns that include the given pattern
   * @param pattern {Pattern}
   * @return {*|Array}
   */
  lineageR: function (pattern) {
    var nodes = this.graph.predecessors(nodeName(pattern));
    return this.nodes2patterns(nodes);
  },

  /**
   * Given a {Pattern}, return all {Pattern} objects included in this the given pattern
   * @param pattern
   */
  lineageIndex: function (pattern) {
    var lineage = this.lineage(pattern);
    return lineage.map(p => p.patternPartial);
  },

  /**
   * Given a {Pattern}, return all {Pattern} objects which include the given pattern
   * @param pattern
   */
  lineageRIndex: function (pattern) {
    var lineageR = this.lineageR(pattern);
    return lineageR.map(p => p.patternPartial);
  },

  /**
   *
   * @returns {{timestamp: number, graph}}
   */
  toJson: function () {
    return {
      timestamp: new Date().getTime(),
      graph: graphlib.json.write(this.graph)
    };
  }
};

PatternGraph.prototype.nodes = () => this.graph.nodes();

PatternGraph.empty = function () {
  return new PatternGraph(null, 0);
};

/**
 * Parse the graph from a JSON string.
 * @param s
 */
PatternGraph.fromJson = function (o) {
  var graph = graphlib.json.read(o.graph);
  var timestamp = new Date(o.timestamp);
  return new PatternGraph(graph, timestamp);
};

PatternGraph.resolveJsonGraphFile = function (patternlab, file) {
  return path.resolve(patternlab.config.paths.public.root, file || 'dependencyGraph.json');
};

/**
 * Loads a graph from the file. Does not add any patterns from the patternlab object,
 * i.e. graph.patterns will be still empty until all patterns have been processed.
 *
 * @param patternlab
 * @param [file] Optional
 */
PatternGraph.loadFromFile = function (patternlab, file) {
  var jsonGraphFile = this.resolveJsonGraphFile(patternlab, file);

  // File is fresh, so simply constuct an empty graph in memory
  if (!fs.existsSync(jsonGraphFile)) {
    return PatternGraph.empty();
  }

  var obj = fs.readJSONSync(jsonGraphFile);
  return this.fromJson(obj);
};

// Second argument is for unit testing only
PatternGraph.storeToFile = function (patternlab, file) {
  var jsonGraphFile = this.resolveJsonGraphFile(patternlab, file);
  patternlab.graph.timestamp = new Date().getTime();
  fs.writeJSONSync(jsonGraphFile, patternlab.graph.toJson());
};

PatternGraph.exportToDot = function (patternlab, file) {
  var dotFile = this.resolveJsonGraphFile(patternlab, file);
  var g = PatternGraphDot.write(patternlab.graph);
  fs.outputFileSync(dotFile, g);
};

module.exports = {
  PatternGraph: PatternGraph
};
