'use strict';

var
  q = require('q'),
  Repo = require('git-tools'),
  packageJson = require('../../package.json'),

  deployData = {};


function requestBranch() {

  var
    repo = new Repo(),
    deferred = q.defer();

  function onRequestCurrentBranchCallback(error, branch) {

    if (error) {
      rejectPromise(error);
      return;
    }

    if (branch === null) {
      repo.branches(onRequestBranchesCallback)
    }
    else {
      resolvePromise(branch);
    }
  }

  function onRequestBranchesCallback(error, branches) {

    if (error) {
      rejectPromise(error);
      return;
    }
    resolvePromise(branches[branches.length - 1].name);
  }

  function rejectPromise(error) {
    deferred.reject(error);
  }

  function resolvePromise(branch) {
    deployData.isMaster = (branch === 'master');
    deployData.branch = branch;
    deployData.version = deployData.isMaster ? packageJson.version : 'branch/' + deployData.branch;
    deferred.resolve();
  }

  repo.currentBranch(onRequestCurrentBranchCallback);

  return deferred.promise;
}

function requestCommitHash() {

  var
    repo = new Repo(),
    deferred = q.defer();

  function onRequestCommitCallback(error, data) {

    if (error) {
      deferred.reject(error);
      return;
    }
    deployData.commit = data.toString().substring(0, 8);
    deferred.resolve();
  }

  repo.exec("rev-parse", "HEAD", onRequestCommitCallback);

  return deferred.promise;
}

function getBranchData() {
  return q.all([requestBranch(), requestCommitHash()])
}

function repositoryConstructor(sharedDeployData) {
  deployData = sharedDeployData;
  return {
    getBranchData: getBranchData
  }
}

module.exports = repositoryConstructor;