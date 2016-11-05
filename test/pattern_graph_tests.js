"use strict";


var PatternGraph = require('../core/lib/pattern_graph').PatternGraph;
var tap = require('tap');

var patternlab = {
  config: {
    paths: {
      public: "./test/public"
    }
  }
};

tap.test("Loading an empty graph works", (test) => {
  var g = PatternGraph.loadFromFile(patternlab);
  tap.equal(g.graph.nodes().length, 0,"foo");
  test.end();
});
