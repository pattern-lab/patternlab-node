'use strict';

var
  gulp = require('gulp'),
  util = require('gulp-util'),
  q = require('q'),
  rename = require('gulp-rename'),
  helper = require('./helper'),
  packageJson = require('../../package.json'),

  deployData = {},
  awsSettings = {};

function upload() {

  var
    download = require('gulp-download'),
    deployDir = 'styleguide/' + deployData.version,
    deferred = q.defer();

  util.log(util.colors.green("Downloading cache file if exists in S3 bucket '" + awsSettings.params.Bucket + "' from dir '" + deployDir + "'..."));

  download(packageJson.aws.publicUrl + '/' + awsSettings.params.Bucket + '/' + deployDir + '/' + '.awspublish-' + awsSettings.params.Bucket)
    .pipe(gulp.dest('./'))
    .on('end', function() {
      var
        awspublish = require('gulp-awspublish'),
        publisher = awspublish.create(awsSettings),
        maxAge = deployData.isMaster ? 1209600 : 120,
        s3Headers = {
        'Cache-Control': 'max-age=' + maxAge + ', no-transform, public'
        };

      util.log(util.colors.green("Deploying to S3 bucket '" + awsSettings.params.Bucket + "' to target dir '" + deployDir + "'. [Cache-Control: "+s3Headers['Cache-Control']+"]"));

      gulp.src(helper.getTargetDir() + '/**/*')
        .pipe(rename(function (path) {
          path.dirname = deployDir + '/' + path.dirname;
        }))
        .pipe(awspublish.gzip({}))
        .pipe(publisher.publish(s3Headers))
        .pipe(publisher.sync(deployDir))
        .pipe(publisher.cache())
        .pipe(awspublish.reporter())
        .on('end', function(err) {
          if (err) {
            return deferred.reject(err);
          }

          util.log(util.colors.green("Done. Re-uploading cache file into S3 bucket '" + awsSettings.params.Bucket + "' to target dir '" + deployDir + "'..."));

          gulp.src('.awspublish-' + awsSettings.params.Bucket)
            .pipe(rename(function (path) {
              path.dirname = deployDir + '/' + path.dirname;
            }))
            .pipe(publisher.publish())
            .pipe(awspublish.reporter())
            .on('end', function() {
              deferred.resolve();
            });
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