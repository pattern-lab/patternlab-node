'use strict';

var
  gulp = require('gulp'),
  q = require('q'),
  util = require('gulp-util'),
  rename = require('gulp-rename'),
  awspublish = require('gulp-awspublish'),
  helper = require('./helper'),
  packageJson = require('../../package.json'),

  deployData = {},
  awsSettings = {};

function upload() {

  var
    download = require('gulp-download'),
    deferred = q.defer(),
    publisher = awspublish.create(awsSettings);

  util.log(util.colors.green("Deploying to S3 bucket '" + awsSettings.params.Bucket + "' to target dir '" + deployData.version + "'."));

  download(packageJson.aws.publicUrl + '/' + awsSettings.params.Bucket + '/' + deployData.version + '/' + '.awspublish-' + awsSettings.params.Bucket)
    .pipe(gulp.dest('./'))
    .pipe(gulp.src(helper.getTargetDir() + '/**/*'))
    .pipe(rename(function (path) {
      path.dirname = deployData.version + '/' + path.dirname;
    }))
    .pipe(awspublish.gzip({}))
    .pipe(publisher.publish())
    .pipe(publisher.sync(deployData.version))
    .pipe(publisher.cache())
    .pipe(awspublish.reporter())
    .on('end', function (error) {
      if (error) {
        return deferred.reject(error);
      }

      util.log(util.colors.green("Uploading S3 cache file to bucket '" + awsSettings.params.Bucket + "' to target dir '" + deployData.version + "'."));
      gulp.src('.awspublish-' + awsSettings.params.Bucket)
        .pipe(rename(function (path) {
          path.dirname = deployData.version + '/' + path.dirname;
        }))
        .pipe(publisher.publish())
        .pipe(awspublish.reporter())
        .on('end', function() {
          deferred.resolve();
        });
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