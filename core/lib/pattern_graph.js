"use strict";

var graphlib = require('graphlib');
var Graph = graphlib.Graph;
var path = require('path');
var fs = require("fs-extra");
var Pattern = require('./object_factory').Pattern;

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

  this.graph = graph
    || new Graph({
      directed: true
  });
  this.graph.setDefaultEdgeLabel({});
  // Allows faster lookups for patterns by name for each element in the graph
  this.patterns = new Map();
  this.timestamp = timestamp || new Date().getTime();
};

// shorthand
var name =
  p => p instanceof Pattern ? p.patternPartial : p;

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
  add: function(pattern) {
    var n = name(pattern);
    if (!this.graph.hasNode(n)) {
      this.graph.setNode(n, {});
      this.patterns.set(n, pattern);
    }
  },

  remove: function (pattern) {
    var n = name(pattern);
    this.graph.removeNode(n);
    this.patterns.remove(n);
  },

  filter: function(fn) {
    this.graph.nodes().forEach(n => {
        if (!fn(n)) {
          this.remove(n);
        }
      }
    );
  },


  link: function (patternFrom, patternTo) {
    this.add(patternFrom);
    this.add(patternTo);
    // maybe we also can put reverse edges here

    let nameFrom = name(patternFrom);
    let nameTo = name(patternTo);
    this.graph.setEdge(nameFrom, nameTo);
  },

  node: function (pattern) {
    return this.graph.node(name(pattern));
  },

  /**
   *
   * @param nodes {Array}
   * @return {Array} An Array of Patterns
   */
  nodes2patterns: function (nodes) {
    return nodes.map(n => this.patterns.get(n));
  },

  lineage: function (pattern) {
    var outEdges = this.graph.outEdges(name(pattern));
    var nodes = outEdges.map(edge => edge['w']);
    return this.nodes2patterns(nodes);
  },

  /**
   * Returns all patterns that include the given pattern
   * @param pattern {Pattern}
   * @return {*|Array}
   */
  lineageR: function (pattern) {
    var inEdges = this.graph.inEdges(name(pattern));
    var nodes = inEdges.map(edge => edge['v']);
    return this.nodes2patterns(nodes);
  },

  /**
   * Given a {Pattern}, return all {Pattern} objectes included in this one
   * @param pattern
   */
  lineageIndex: function (pattern) {
    var lineage = this.lineage(pattern);
    return lineage.map( p => p.patternPartial);
  },

  /**
   * Given a {Pattern}, return all {Pattern} objectes included in this one
   * @param pattern
   */
  lineageRIndex: function (pattern) {
    var lineageR = this.lineageR(pattern);
    return lineageR.map( p => p.patternPartial);
  },

  /**
   *
   * @returns {{timestamp: number, graph}}
   */
  toJson: function () {
    return {
      timestamp: new Date().getTime(),
      graph: graphlib.json.write(this.graph)
    }
  }
};

PatternGraph.prototype.nodes = () => this.graph.nodes();

/**
 * Parse the graph from a JSON string.
 * @param s
 */
PatternGraph.fromJson = function (s) {
  var o = JSON.parse(s);
  var graph = graphlib.json.read(o.graph);
  var timestamp = new Date(o.timestamp);
  return new PatternGraph(graph, timestamp);
};

// Seperate method, makes testing easier
PatternGraph.resolveJsonGraphFile = function (patternlab, file) {
  return path.resolve(patternlab.config.paths.public, file || 'dependencyGraph.json');
};

// Second argument is for unit testing only
PatternGraph.loadFromFile = function (patternlab, file) {
  var jsonGraphFile = this.resolveJsonGraphFile(patternlab, file);
  // File is fresh, so simply constuct an empty graph in memory
  if (!fs.existsSync(jsonGraphFile)) {
    return new PatternGraph(null, new Date().getTime());
  }

  var obj = fs.readJSONSync(jsonGraphFile);
  return this.fromJson(obj);
};

PatternGraph.empty = function () {
  return new PatternGraph(null, 0);
};

module.exports = {
  PatternGraph: PatternGraph
};