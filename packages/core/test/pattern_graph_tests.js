'use strict';

var path = require('path');
var tap = require('tap');

var PatternGraph = require('../src/lib/pattern_graph').PatternGraph;
var VERSION = require('../src/lib/pattern_graph').PATTERN_GRAPH_VERSION;
var Pattern = require('../src/lib/object_factory').Pattern;
var CompileState = require('../src/lib/object_factory').CompileState;
const posixPath = require('./util/test_utils.js').posixPath;
var config = require('./util/patternlab-config.json');
var engineLoader = require('../src/lib/pattern_engines');
engineLoader.loadAllEngines(config);

var patternlab = {
  config: {
    paths: {
      public: {
        root: `${__dirname}/public`,
      },
    },
  },
};

var mockGraph = function() {
  return PatternGraph.empty();
};

tap.test('checkVersion - Current version returns true', test => {
  test.same(PatternGraph.checkVersion({ version: VERSION }), true);
  test.end();
});

tap.test('checkVersion - Older version returns false', test => {
  test.same(PatternGraph.checkVersion({ version: VERSION - 1 }), false);
  test.end();
});

tap.test('Loading an empty graph works', test => {
  var g = PatternGraph.loadFromFile(
    path.resolve(__dirname, 'public'),
    'does not exist'
  );
  tap.equal(g.graph.nodes().length, 0, 'foo');
  test.end();
});

tap.test('PatternGraph.fromJson() - Loading a graph from JSON', test => {
  var graph = PatternGraph.loadFromFile(
    path.resolve(__dirname, 'public'),
    'testDependencyGraph.json'
  );
  test.same(graph.timestamp, 1337);
  test.same(graph.graph.nodes(), ['atom-foo', 'molecule-foo']);
  test.same(graph.graph.edges(), [{ v: 'molecule-foo', w: 'atom-foo' }]);
  test.end();
});

tap.test(
  'PatternGraph.fromJson() - Loading a graph from JSON using an older version throws error',
  test => {
    test.throws(
      function() {
        PatternGraph.fromJson({ version: 0 });
      },
      {},
      /Version of graph on disk.*/g
    );

    test.end();
  }
);

tap.test('toJson() - Storing a graph to JSON correctly', test => {
  var graph = mockGraph();
  graph.timestamp = 1337;
  var atomFoo = Pattern.create('atom-foo', null, {
    compileState: CompileState.CLEAN,
  });
  var moleculeFoo = Pattern.create('molecule-foo', null, {
    compileState: CompileState.CLEAN,
  });
  graph.add(atomFoo);
  graph.add(moleculeFoo);
  graph.link(moleculeFoo, atomFoo);
  test.same(graph.toJson(), {
    version: VERSION,
    timestamp: 1337,
    graph: {
      options: { directed: true, multigraph: false, compound: false },
      nodes: [
        { v: 'atom-foo', value: { compileState: 'clean' } },
        { v: 'molecule-foo', value: { compileState: 'clean' } },
      ],
      edges: [{ v: 'molecule-foo', w: 'atom-foo', value: {} }],
    },
  });
  // For generating the above output:console.log(JSON.stringify(graph.toJson()));
  test.end();
});

tap.test(
  'Storing and loading a graph from JSON return the identical graph',
  test => {
    var oldGraph = mockGraph();
    oldGraph.timestamp = 1337;
    var atomFoo = Pattern.create('atom-foo', null, {
      compileState: CompileState.CLEAN,
    });
    var moleculeFoo = Pattern.create('molecule-foo', null, {
      compileState: CompileState.CLEAN,
    });
    oldGraph.add(atomFoo);
    oldGraph.add(moleculeFoo);
    oldGraph.link(moleculeFoo, atomFoo);

    // act
    var newGraph = PatternGraph.fromJson(oldGraph.toJson());

    // assert
    test.same(newGraph.version, VERSION);
    test.same(newGraph.timestamp, 1337);
    test.same(newGraph.graph.nodes(), ['atom-foo', 'molecule-foo']);
    test.same(newGraph.graph.edges(), [{ w: 'atom-foo', v: 'molecule-foo' }]);
    // The graph is a new object
    test.notEqual(newGraph, oldGraph);
    test.end();
  }
);

tap.test('clone()', test => {
  var oldGraph = mockGraph();
  oldGraph.timestamp = 1337;
  var atomFoo = Pattern.create('atom-foo', null, {
    compileState: CompileState.CLEAN,
  });
  var moleculeFoo = Pattern.create('molecule-foo', null, {
    compileState: CompileState.CLEAN,
  });
  oldGraph.add(atomFoo);
  oldGraph.add(moleculeFoo);
  oldGraph.link(moleculeFoo, atomFoo);

  // act
  var newGraph = oldGraph.clone();

  // assert
  test.same(newGraph.version, VERSION);
  test.same(newGraph.timestamp, 1337);
  test.same(newGraph.graph.nodes(), ['atom-foo', 'molecule-foo']);
  test.same(newGraph.graph.edges(), [{ w: 'atom-foo', v: 'molecule-foo' }]);
  // The graph is a new object
  test.notEqual(newGraph, oldGraph);
  test.end();
});

tap.test('Adding a node', test => {
  var g = mockGraph();
  var pattern = Pattern.create('atom-foo', null, {
    compileState: CompileState.CLEAN,
  });
  g.add(pattern);
  test.same(
    { compileState: CompileState.CLEAN },
    g.node('atom-foo'),
    'Data were set correctly'
  );
  var actual = g.nodes();
  test.same(actual, ['atom-foo']);
  test.end();
});

tap.test('Adding a node twice', test => {
  var g = mockGraph();
  var pattern = Pattern.create('atom-foo', null, {
    compileState: CompileState.CLEAN,
  });
  g.add(pattern);
  g.add(pattern);
  var actual = g.nodes();
  test.same(actual, ['atom-foo']);
  test.end();
});

tap.test('Adding two nodes', test => {
  var g = mockGraph();
  var atomFoo = Pattern.create('atom-foo', {
    compileState: CompileState.CLEAN,
  });
  var moleculeFoo = Pattern.create('molecule-foo', {
    compileState: CompileState.CLEAN,
  });
  g.add(atomFoo);
  g.add(moleculeFoo);
  var actual = g.nodes();
  test.same(actual, ['atom-foo', 'molecule-foo']);
  test.end();
});

tap.test('Adding two nodes with only different subpattern types', test => {
  var g = mockGraph();
  var atomFoo = Pattern.create('00-atoms/00-foo/baz.html', {
    compileState: CompileState.CLEAN,
  });
  var moleculeFoo = Pattern.create('00-atoms/00-bar/baz.html', {
    compileState: CompileState.CLEAN,
  });
  g.add(atomFoo);
  g.add(moleculeFoo);
  var actual = g.nodes();
  test.same(posixPath(actual), [
    '00-atoms/00-foo/baz.html',
    '00-atoms/00-bar/baz.html',
  ]);
  test.end();
});

tap.test('Linking two nodes', test => {
  var g = mockGraph();
  var atomFoo = Pattern.create('atom-foo', null, {
    compileState: CompileState.CLEAN,
  });
  var moleculeFoo = Pattern.create('molecule-foo', null, {
    compileState: CompileState.CLEAN,
  });
  g.add(atomFoo);
  g.add(moleculeFoo);
  g.link(moleculeFoo, atomFoo);
  test.same(
    g.graph.edges(),
    [{ v: 'molecule-foo', w: 'atom-foo' }],
    'There is an edge from v to w'
  );
  test.end();
});

tap.test('remove() - Removing a node', test => {
  var g = mockGraph();
  var atomFoo = Pattern.create('atom-foo', null, {
    compileState: CompileState.CLEAN,
  });
  var moleculeFoo = Pattern.create('molecule-foo', null, {
    compileState: CompileState.CLEAN,
  });
  g.add(atomFoo);
  g.add(moleculeFoo);
  test.same(g.nodes(), ['atom-foo', 'molecule-foo']);
  g.remove(moleculeFoo);
  test.same(
    g.graph.nodes(),
    ['atom-foo'],
    'The molecule was removed from the graph'
  );
  test.same(
    g.patterns.allPatterns()[0].relPath,
    'atom-foo',
    'The molecule was removed from the known patterns'
  );
  test.end();
});

tap.test('filter() - Removing nodes via filter', test => {
  var g = mockGraph();
  var atomFoo = Pattern.create('atom-foo', null, {
    compileState: CompileState.CLEAN,
  });
  var moleculeFoo = Pattern.create('molecule-foo', null, {
    compileState: CompileState.CLEAN,
  });
  g.add(atomFoo);
  g.add(moleculeFoo);
  test.same(g.nodes(), ['atom-foo', 'molecule-foo']);
  g.filter(n => n != 'molecule-foo');
  test.same(
    g.graph.nodes(),
    ['atom-foo'],
    'The molecule was removed from the graph'
  );
  test.same(
    g.patterns.allPatterns()[0].relPath,
    'atom-foo',
    'The molecule was removed from the known patterns'
  );
  test.end();
});

// Prevents nodes from escaping the scope, at the same time have some default graph for lineage to
// test on
(function() {
  var atomFoo = Pattern.create('00-atom/xy/foo', null, {
    compileState: CompileState.CLEAN,
  });
  var atomIsolated = Pattern.create('00-atom/xy/isolated', null, {
    compileState: CompileState.CLEAN,
  });
  var moleculeFoo = Pattern.create('01-molecule/xy/foo', null, {
    compileState: CompileState.CLEAN,
  });
  var moleculeBar = Pattern.create('01-molecule/xy/bar', null, {
    compileState: CompileState.CLEAN,
  });
  var organismFoo = Pattern.create('02-organism/xy/foo', null, {
    compileState: CompileState.CLEAN,
  });
  var organismBar = Pattern.create('02-organism/xy/bar', null, {
    compileState: CompileState.CLEAN,
  });

  var g = mockGraph();

  // Included nowhere
  g.add(atomIsolated);

  g.add(atomFoo);
  g.add(moleculeFoo);
  g.add(moleculeBar);
  g.add(organismFoo);
  g.add(organismBar);
  // single molecule
  g.link(organismFoo, moleculeFoo);

  // include two molecules
  g.link(organismBar, moleculeFoo);
  g.link(organismBar, moleculeBar);

  // both include atomFoo
  g.link(moleculeFoo, atomFoo);
  g.link(moleculeBar, atomFoo);

  tap.test('lineage() - Calculate the lineage of a node', test => {
    test.same(posixPath(g.lineage(organismFoo).map(p => p.relPath)), [
      '01-molecule/xy/foo',
    ]);
    test.same(posixPath(g.lineage(organismBar).map(p => p.relPath)), [
      '01-molecule/xy/foo',
      '01-molecule/xy/bar',
    ]);
    test.same(posixPath(g.lineage(moleculeFoo).map(p => p.relPath)), [
      '00-atom/xy/foo',
    ]);
    test.same(posixPath(g.lineage(moleculeBar).map(p => p.relPath)), [
      '00-atom/xy/foo',
    ]);
    test.same(g.lineage(atomFoo).map(p => p.relPath), []);
    test.same(g.lineage(atomIsolated).map(p => p.relPath), []);
    test.end();
  });

  tap.test('lineageIndex() - Calculate the lineage of a node', test => {
    test.same(g.lineageIndex(organismFoo), ['molecule-foo']);
    test.same(g.lineageIndex(organismBar), ['molecule-foo', 'molecule-bar']);
    test.same(g.lineageIndex(moleculeFoo), ['atom-foo']);
    test.same(g.lineageIndex(moleculeBar), ['atom-foo']);
    test.same(g.lineageIndex(atomFoo), []);
    test.same(g.lineageIndex(atomIsolated), []);
    test.end();
  });

  tap.test('lineageR() - Calculate the reverse lineage of a node', test => {
    test.same(g.lineageR(organismFoo).map(p => p.relPath), []);
    test.same(g.lineageR(organismBar).map(p => p.relPath), []);
    test.same(posixPath(g.lineageR(moleculeFoo).map(p => p.relPath)), [
      '02-organism/xy/foo',
      '02-organism/xy/bar',
    ]);
    test.same(posixPath(g.lineageR(moleculeBar).map(p => p.relPath)), [
      '02-organism/xy/bar',
    ]);
    test.same(posixPath(g.lineageR(atomFoo).map(p => p.relPath)), [
      '01-molecule/xy/foo',
      '01-molecule/xy/bar',
    ]);
    test.same(g.lineageR(atomIsolated).map(p => p.relPath), []);
    test.end();
  });

  tap.test('lineageRIndex() - Calculate the lineage index of a node', test => {
    test.same(g.lineageRIndex(organismFoo), []);
    test.same(g.lineageRIndex(organismBar), []);
    test.same(g.lineageRIndex(moleculeFoo), ['organism-foo', 'organism-bar']);
    test.same(g.lineageRIndex(moleculeBar), ['organism-bar']);
    test.same(g.lineageRIndex(atomFoo), ['molecule-foo', 'molecule-bar']);
    test.same(g.lineageRIndex(atomIsolated), []);
    test.end();
  });
})();

(function() {
  function TestGraph() {
    function csAt(args, idx) {
      return { compileState: args[idx] || CompileState.CLEAN };
    }
    var i = 0;
    var atomFoo = (this.atomFoo = Pattern.create(
      '00-atom/xy/foo',
      null,
      csAt(arguments, i++)
    ));
    var atomIsolated = (this.atomIsolated = Pattern.create(
      '00-atom/xy/isolated',
      null,
      csAt(arguments, i++)
    ));
    var moleculeFoo = (this.moleculeFoo = Pattern.create(
      '01-molecule/xy/foo',
      null,
      csAt(arguments, i++)
    ));
    var moleculeBar = (this.moleculeBar = Pattern.create(
      '01-molecule/xy/bar',
      null,
      csAt(arguments, i++)
    ));
    var organismFoo = (this.organismFoo = Pattern.create(
      '02-organism/xy/foo',
      null,
      csAt(arguments, i++)
    ));
    var organismBar = (this.organismBar = Pattern.create(
      '02-organism/xy/bar',
      null,
      csAt(arguments, i++)
    ));

    var graph = (this.graph = mockGraph());

    // Included nowhere
    graph.add(atomIsolated);

    graph.add(atomFoo);
    graph.add(moleculeFoo);
    graph.add(moleculeBar);
    graph.add(organismFoo);
    graph.add(organismBar);
    // single molecule
    graph.link(organismFoo, moleculeFoo);

    // include two molecules
    graph.link(organismBar, moleculeFoo);
    graph.link(organismBar, moleculeBar);

    // both include atomFoo
    graph.link(moleculeFoo, atomFoo);
    graph.link(moleculeBar, atomFoo);
  }

  tap.test(
    'compileOrder() - A clean graph results in no nodes to recompile',
    test => {
      var g = new TestGraph();
      var co = g.graph.compileOrder();
      test.equals(0, co.length);
      test.end();
    }
  );

  tap.test(
    'compileOrder() - Recompile isolated atoms does not do anything else',
    test => {
      var g = new TestGraph(
        // atomFoo
        CompileState.CLEAN,
        // atomIsolated
        CompileState.NEEDS_REBUILD
      );

      var co = g.graph.compileOrder();
      test.same([g.atomIsolated], co, 'Only recompile atomIsolated');
      co.forEach(p =>
        test.same(
          p.compileState,
          CompileState.NEEDS_REBUILD,
          'All patterns are marked for rebuilding'
        )
      );

      test.end();
    }
  );

  tap.test(
    'compileOrder() - Changing a linked atom bubbles back to the organisms',
    test => {
      // Almost every pattern - except atomIsolated - has a transitive dependency on atomFoo
      var g = new TestGraph(CompileState.NEEDS_REBUILD);
      var co = g.graph.compileOrder();

      test.equals(5, co.length);
      test.same(
        [g.atomFoo, g.moleculeFoo, g.organismFoo, g.moleculeBar, g.organismBar],
        co,
        'Recompile everything except atomIsolated'
      );
      co.forEach(p =>
        test.same(
          p.compileState,
          CompileState.NEEDS_REBUILD,
          'All patterns are marked for rebuilding'
        )
      );

      test.end();
    }
  );

  tap.test(
    'compileOrder() - Changing a molecule leaves atoms untouched',
    test => {
      // Bubble up from molecules to organisms, leaving atoms unchanged as they were not modified
      var g = new TestGraph(null, null, CompileState.NEEDS_REBUILD);
      var co = g.graph.compileOrder();

      test.same(
        [g.moleculeFoo, g.organismFoo, g.organismBar],
        co,
        'Recompile moleculeFoo and transitive dependencies'
      );
      co.forEach(p =>
        test.same(
          p.compileState,
          CompileState.NEEDS_REBUILD,
          'All patterns are marked for rebuilding'
        )
      );
      test.end();
    }
  );

  tap.test(
    'compileOrder() - Changing an organism leaves atoms and molecules untouched',
    test => {
      // Almost every pattern - except atomIsolated - has a transitive dependency on atomFoo
      var g = new TestGraph(
        // atoms
        null,
        null,
        // molecules
        null,
        null,
        // organismFoo
        CompileState.NEEDS_REBUILD
      );
      var co = g.graph.compileOrder();

      test.same([g.organismFoo], co);
      test.same(
        co[0].compileState,
        CompileState.NEEDS_REBUILD,
        'All patterns are marked for rebuilding'
      );
      test.end();
    }
  );

  tap.test('compileOrder() - Recompile everything', test => {
    // Almost every pattern - except atomIsolated - has a transitive dependency on atomFoo
    // Also recompile atomIsolated
    var g = new TestGraph(
      CompileState.NEEDS_REBUILD,
      CompileState.NEEDS_REBUILD
    );
    var compileOrder = g.graph.compileOrder();

    test.same(
      [
        g.atomIsolated,
        g.atomFoo,
        g.moleculeFoo,
        g.organismFoo,
        g.moleculeBar,
        g.organismBar,
      ],
      compileOrder,
      'Recompile everything except atomIsolated'
    );
    compileOrder.forEach(p =>
      test.same(
        p.compileState,
        CompileState.NEEDS_REBUILD,
        'All patterns are marked for rebuilding'
      )
    );
    test.end();
  });
})();
