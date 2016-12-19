"use strict";

/**
 * Overall settings
 * @return {[string,string,string,string,string,string,string]}
 */
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

/**
 * Graph nodes cannot start with numbers in GrahViz and must not contain dashes.
 * @param name
 * @return {string}
 */
const niceKey = function (name) {
  return "O" + name.replace("-", "");
};

/**
 * Adds the output for defining a node in GraphViz.
 *
 * @param {Pattern} pattern
 * @return {string}
 */
function addNode(pattern) {
  let more = "";
  if (pattern.isPseudoPattern) {
    more = " [fillcolor=grey]";
  }
  return "\"" + pattern.name + "\"" + more + ";\n";
}

/**
 *
 * @param {Pattern} from
 * @param {Pattern} to
 * @param {string} color A valid color, e.g. HTMl or a color name
 * @return {string}
 */
function addEdge(from, to, color) {
  return `"${from.name}" -> "${to.name}" [color=${color}];\n`;
}

/**
 * Creates a sub-graph which is used to group atoms, molecules, etc.
 * @param group
 * @param patterns
 * @return {[*,*,string,string,*,*,string]}
 */
function subGraph(group, patterns) {
  const s = niceKey(group);
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

const PatternGraphDot = {};

/**
 * Create the GraphViz representation of the given graph
 * @param patternGraph
 * @return {string}
 */
PatternGraphDot.generate = function (patternGraph) {
  const g = patternGraph.graph;
  const patterns = patternGraph.patterns;
  let buckets = new Map();
  const colors = ["darkgreen", "firebrick", "slateblue", "darkgoldenrod", "black"];
  const colorMap = new Map();
  let colIdx = 0;
  for (let p of patterns.partials.values()) {
    if (p.isPseudoPattern || !p.patternType) {
      continue;
    }
    let bucket = buckets.get(p.patternType);
    if (bucket) {
      bucket.push(p);
    } else {
      bucket = [p];
      colorMap.set(p.patternType, colors[colIdx++]);

      // Repeat if there are more categories
      colIdx = colIdx % colors.length;
    }
    buckets.set(p.patternType, bucket);
  }

  let res = header();
  const sortedKeys = Array.from(buckets.keys()).sort();

  const niceKeys = sortedKeys.map(niceKey);

  let subGraphLines = [];


  for (let key of sortedKeys) {
    const subPatterns = buckets.get(key);
    subGraphLines = subGraphLines.concat(subGraph(key, subPatterns));
  }
  res = res.concat(subGraphLines);
  res.push("edge[style=solid];");


  foo: for (let edge of g.edges()) {
    let fromTo = patternGraph.nodes2patterns([edge.v, edge.w]);
    for (let pattern of fromTo) {
      if (pattern.isPseudoPattern || !pattern.patternType) {
        continue foo;
      }
    }
    const thisColor = colorMap.get(fromTo[0].patternType);
    res.push(addEdge(fromTo[0], fromTo[1], thisColor));
  }

  res.push(niceKeys.reverse().join(" -> ") + "[constraint=true];");
  res = res.concat(footer());
  return res.join("\n") + "\n";
};


module.exports = PatternGraphDot;
