'use strict';

var
  gulp = require('gulp'),
  q = require('q'),
  util = require('gulp-util'),
  https = require('https'),
  objectMerge = require('object-merge'),
  packageJson = require('../../package.json'),

  deployData = {};

function requestKirbyEndpoint(options, deferred, body, hash) {

  var defaultOptions = {
    hostname: packageJson.kirby.hostname,
    path: packageJson.kirby.path + '/' + hash,
    port: packageJson.kirby.port || 443
  };
  options = objectMerge(defaultOptions, options);

  var
    req = https.request(options, function (res) {

      var payload = '';
      res
        .on('error', deferred.reject)
        .on('data', function (chunk) {
          payload += chunk.toString('utf8');
        })
        .on('end', function () {
          try {
            var body = JSON.parse(payload);
            deferred.resolve(body);
          }
          catch (error) {
            console.log(payload);
            deferred.reject(error);
          }
        });
    });

  if (options.method === 'POST') {
    req.write(body);
  }

  req.end();

  return deferred.promise;
}

function storeVersionOnKirbyInstance(namespace) {
  var
    deferred = q.defer(),
    body = JSON.stringify(deployData),
    hash = require('crypto').createHash('md5').update(deployData.commit + '-----' + deployData.version).digest('hex'),
    options = {
      method: 'POST',
      path: packageJson.kirby[namespace + "Endpoint"] + '/' + hash,
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
        'Accept': 'application/json',
        'Content-Length': body.length
      }
    };

  util.log(util.colors.green("Update " + namespace + " version on Kirby instance '" + packageJson.kirby.hostname + "'. (" + body + ")"));


  return requestKirbyEndpoint(options, deferred, body, hash);
}

function kirbyConstructor(sharedDeployData) {

  deployData = sharedDeployData;

  return {
    storeVersionOnKirbyInstance: storeVersionOnKirbyInstance
  }
}

module.exports = kirbyConstructor;