'use strict';

var
  gulp = require('gulp'),
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
    merge = require('merge-stream'),
    publisher = awspublish.create(awsSettings);

  util.log(util.colors.green("Deploying to S3 bucket '" + awsSettings.params.Bucket + "' to target dir '" + deployData.version + "'."));

  var cacheDownloadStream = download(packageJson.aws.publicUrl + '/' + awsSettings.params.Bucket + '/' + deployData.version + '/' + '.awspublish-' + awsSettings.params.Bucket)
    .pipe(gulp.dest('./'));

  var fileUploadStream = gulp.src(helper.getTargetDir() + '/**/*')
    .pipe(rename(function (path) {
      path.dirname = deployData.version + '/' + path.dirname;
    }))
    .pipe(awspublish.gzip({}))
    .pipe(publisher.publish())
    .pipe(publisher.sync(deployData.version))
    .pipe(publisher.cache())
    .pipe(awspublish.reporter());

  var cacheUploadStream = gulp.src('.awspublish-' + awsSettings.params.Bucket)
    .pipe(rename(function (path) {
      path.dirname = deployData.version + '/' + path.dirname;
    }))
    .pipe(publisher.publish())
    .pipe(awspublish.reporter());

  return merge(cacheDownloadStream, fileUploadStream, cacheUploadStream);
}


function awspublishConstructor(sharedAwsSettings, sharedDeployData) {

  deployData = sharedDeployData;
  awsSettings = sharedAwsSettings;

  return {
    upload: upload
  }
}

module.exports = awspublishConstructor;