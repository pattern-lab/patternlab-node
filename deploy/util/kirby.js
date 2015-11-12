'use strict';

var
  gulp = require('gulp'),
  q = require('q'),
  util = require('gulp-util'),
  sshClient = require('node-sshclient').SSH,
  packageJson = require('../../package.json'),

  deployData = {},

  ssh = new sshClient({
    hostname: packageJson.kirby.hostname,
    user: packageJson.kirby.username,
    port: 22
  });

function storeVersionOnKirbyInstance(namespace) {

  var
    deferred = q.defer(),
    deployDataJson = JSON.stringify(deployData),
    filename = packageJson.kirby.baseDestination + '/content/'+namespace+'-version.json';

  ssh.command('echo \'' + deployDataJson + '\' > ' + filename + ' && chmod 777 ' + filename, '', deferred.resolve);

  util.log(util.colors.green("Update '" + filename + "' on Kirby instance '" + packageJson.kirby.hostname + "'. (" + deployDataJson + ")"));

  return deferred.promise;
}


function kirbyConstructor(sharedDeployData) {

  deployData = sharedDeployData;

  return {
    storeVersionOnKirbyInstance: storeVersionOnKirbyInstance
  }
}

module.exports = kirbyConstructor;