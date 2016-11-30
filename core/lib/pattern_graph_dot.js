"use strict";
var graphlib = require('graphlib');
var path = require('path');
var fs = require("fs-extra");

function header() {
  return [
  "strict digraph {",
    'graph [fontname = "helvetica" size=20]',
    /*compound=true;*/
     "concentrate=true;",
    "rankdir=LR;",
    "ranksep=\"4 equally·\";",
    "node [style=filled,color=white];",
    "edge [style=dotted constraint=false]"
  ];
}

var niceKey = function (s) {
  return "O" + s.replace("-", "");
};

function subgraph(group, patterns, color) {
  var s = niceKey(group);
  return [
    "subgraph cluster_X" + s + " {",
    "label=<<b>" + group + "</b>>;",
    "style=filled;",
    "color=lightgrey;",
    s + " [shape=box];",
    patterns.map(addNode).join(""),
    //patterns.map(p => "\"" + p.name + "\"").join(" -> ") + "[style=invis]",
    "}"
    ];

}

function footer() {
  return ["}"];
}

  /**
   *
   * @param pattern {Pattern}
   * @return {string}
   */
function addNode(pattern) {
  let more = "";
  if (pattern.isPseudoPattern) {
    more = " [fillcolor=grey]"
  }
  return "\"" + pattern.name + "\"" + more + ";\n";
}

  /**
   *
   * @param from {Pattern}
   * @param to {Pattern}
   * @return {string}
   */
function addEdge (from, to, color) {
  return "\"" + from.name + "\" -> " +  "\"" + to.name + "\" [color=" + color + "];\n";
}

var PatternGraphDot = {};
PatternGraphDot.write = function (patternGraph) {
  var g = patternGraph.graph;
  var patterns = patternGraph.patterns;
  let buckets = new Map();
  var colors = ["darkgreen", "firebrick", "slateblue", "darkgoldenrod", "black"];
  var colorMap = new Map();
  var colIdx = 0;
  for (let p of patterns.partials.values()) {
    if (p.isPseudoPattern || !p.patternType) {
      continue;
    }
    let bucket = buckets.get(p.patternType);
    if (bucket) {
      bucket.push(p)
    } else {
      bucket = [p];
      colorMap.set(p.patternType, colors[colIdx++]);
      // Repeat if there are more categories
      colIdx = colIdx % colors.length;
    }
    buckets.set(p.patternType, bucket);
  }

  /*


   edge[style=\"\", fontsize=12];

   { rank=same;
   0 [style = \"\"];
   01 [style = \"\"];
   02 [style=\"\"];
   0 -> 01 -> 02;
   }
   0 -> "0A"[style=solid];
   01 -> "0B"[style=invis];
   02 -> "0C"[style=invis];
   */
  var res = header();
  var sortedKeys = Array.from(buckets.keys()).sort();

  var niceKeys = sortedKeys.map(niceKey);

  var subgraphLines = [];


  for (let key of sortedKeys) {
    var subpatterns = buckets.get(key);
    subgraphLines = subgraphLines.concat(subgraph(key, subpatterns));
  }
  res = res.concat(subgraphLines);
  res.push("edge[style=solid];");


  foo: for (let e of g.edges()) {
    let vw = patternGraph.nodes2patterns([e.v, e.w]);
    for (let p of vw) {
      if (p.isPseudoPattern || !p.patternType) {
        continue foo;
      }
    }
    var thisColor = colorMap.get(vw[0].patternType);
    res.push(addEdge(vw[0], vw[1], thisColor));
  }

  res.push(niceKeys.reverse().join(" -> ") + "[constraint=true];");
  res = res.concat(footer());
  return res.join("\n") + "\n";
};


module.exports = PatternGraphDot;
