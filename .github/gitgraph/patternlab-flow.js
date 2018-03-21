var graphConfig = new GitGraph.Template({
  colors: [
    '#9993FF',
    '#47E8D4',
    '#6BDB52',
    '#F85BB5',
    '#FFA657',
    '#FFCCAA',
    '#F85BB5',
  ],
  branch: {
    lineWidth: 3,
    spacingX: 60,
    mergeStyle: 'straight',
    showLabel: true, // display branch names on graph
    labelFont: 'normal 10pt Arial',
    labelRotation: 0,
    color: 'black',
  },
  commit: {
    spacingY: -30,
    dot: {
      size: 8,
      strokeColor: '#000000',
      strokeWidth: 4,
    },
    tag: {
      font: 'normal 10pt Arial',
      color: 'yellow',
    },
    message: {
      color: 'black',
      font: 'normal 12pt Arial',
      displayAuthor: false,
      displayBranch: false,
      displayHash: false,
    },
  },
  arrow: {
    size: 8,
    offset: 3,
  },
});

var config = {
  template: graphConfig,
  mode: 'extended',
  orientation: 'horizontal',
};

var bugFixCommit = {
  messageAuthorDisplay: false,
  messageBranchDisplay: false,
  messageHashDisplay: false,
  message: 'Bug fix commit(s)',
};

var stabilizationCommit = {
  messageAuthorDisplay: false,
  messageBranchDisplay: false,
  messageHashDisplay: false,
  message: 'Release stabilization commit(s)',
};

// You can manually fix columns to control the display.
var i = 0;
var longRunningCol = i++;
var featureV3Col = i++;
var developV3Col = i++;
var featureCol = i++;
var developCol = i++;
var releaseCol = i++;
var masterCol = i++;

var gitgraph = new GitGraph(config);

var master = gitgraph.branch({
  name: 'master',
  column: masterCol,
});
master.commit('Initial commit');

var develop = gitgraph.branch({
  parentBranch: master,
  name: 'dev',
  column: developCol,
});

var developV3 = gitgraph.branch({
  parentBranch: master,
  name: 'dev-3.0',
  column: developV3Col,
});

var longRunning = gitgraph.branch({
  parentBranch: master,
  name: 'long-running-improvement',
  column: longRunningCol,
});

develop.commit({
  messageDisplay: false,
});
developV3.commit({
  messageDisplay: false,
});

longRunning.commit({
  messageDisplay: false,
});
longRunning.merge(developV3);

var feature1 = gitgraph.branch({
  parentBranch: develop,
  name: 'feature/1-description',
  column: featureCol,
});
feature1.commit('#1 A feature to go into v2.8.0').commit({
  messageDisplay: false,
});
develop.merge(feature1);
feature1.commit('Small Bugfix').commit({
  messageDisplay: false,
});
feature1.merge(develop);

var feature3X = gitgraph.branch({
  parentBranch: developV3,
  name: 'feature/42-feature-for-3-x-only',
  column: featureV3Col,
});
feature3X.commit('#42 A feature to go into v3.X').commit({
  messageDisplay: false,
});
feature3X.merge(developV3);

var feature2 = gitgraph.branch({
  parentBranch: develop,
  name: 'feature/2-description',
  column: featureCol,
});
feature2.commit('#2 Another feature to go into v2.8.0').commit({
  messageDisplay: false,
});
feature2.merge(develop);
feature2.merge(developV3);

develop.merge(master, {
  dotStrokeWidth: 10,
  message: 'Release v2.8.1 tagged',
  tag: 'v2.8.1',
});

develop.commit({
  messageDisplay: false,
});

longRunning.commit({
  messageDisplay: false,
});

developV3.merge(longRunning);

longRunning.commit({
  messageDisplay: false,
});

var feature3 = gitgraph.branch({
  parentBranch: develop,
  name: 'bugfix/3-description',
  column: featureCol,
});

feature3.commit('A feature to go into v2.8.0').commit({
  messageDisplay: false,
});
feature3.merge(develop);

longRunning.merge(developV3);

developV3.commit({
  messageDisplay: false,
  dotStrokeWidth: 10,
});

develop.commit({
  messageDisplay: false,
});

develop.commit({
  messageDisplay: false,
});

develop.merge(master, {
  dotStrokeWidth: 10,
  message: 'Release v2.9.0 tagged',
  tag: 'v2.9.0',
});

develop.commit({
  messageDisplay: false,
  dotStrokeWidth: 10,
});

developV3.checkout();

/*
developV3.merge(master, {
  dotStrokeWidth: 10,
  message: "Release v3.0.0 tagged",
  tag: "v3.0.0"
});
*/
