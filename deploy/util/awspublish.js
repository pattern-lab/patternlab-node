'use strict';

var
  gulp = require('gulp'),
  q = require('q'),
  util = require('gulp-util'),
  rename = require('gulp-rename'),
  awspublish = require('gulp-awspublish'),
  helper = require('./helper'),

  deployData = {},
  awsSettings = {};

function upload() {

  var
    deferred = q.defer(),
    publisher = awspublish.create(awsSettings);

  util.log(util.colors.green("Deployed to S3 bucket'" + awsSettings.params.Bucket + "' to target dir '" + deployData.version + "'."));

  gulp.src(helper.getTargetDir() + '/**/*')
    .pipe(rename(function (path) {
      path.dirname = deployData.version + '/' + path.dirname;
    }))
    .pipe(publisher.publish())
    .pipe(publisher.sync(deployData.version))
    .pipe(awspublish.reporter())
    .on('end', function (error) {
      if (error) {
        return deferred.reject(error);
      }
      deferred.resolve();
    });

  return deferred.promise;
}


function awspublishConstructor(sharedAwsSettings, sharedDeployData) {

  deployData = sharedDeployData;
  awsSettings = sharedAwsSettings;

  return {
    upload: upload
  }
}

module.exports = awspublishConstructor;