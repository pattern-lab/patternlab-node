const tap = require('tap');
const path = require('path');
const fs = require('fs-extra');
const scaffold = require('../bin/scaffold');
const getUniqueProjectPath = require('./utils/getUniqueProjectPath');
const wrapAsync = require('../bin/utils').wrapAsync;

const projectDir = getUniqueProjectPath();
const sourceDir = 'source';
const publicDir = 'public';
const exportDir = 'patterns_export';

tap.test('Scaffold ->', (t) =>
  wrapAsync(function* () {
    yield scaffold(projectDir, sourceDir, publicDir, exportDir);
    t.ok(fs.existsSync(path.resolve(projectDir)), 'should create project dir');
    t.ok(
      fs.existsSync(path.resolve(projectDir, sourceDir)),
      'should create source dir'
    );
    t.ok(
      fs.existsSync(path.resolve(projectDir, publicDir)),
      'should create public dir'
    );
    t.ok(
      fs.existsSync(path.resolve(projectDir, exportDir)),
      'should create export dir'
    );
    t.end();
  })
);
