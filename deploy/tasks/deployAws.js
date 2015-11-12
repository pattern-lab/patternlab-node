'use strict';

var
  deployData = {},
  q = require('q'),
  packageJson = require('../../package.json'),

  awsSettings = {
    accessKeyId: process.env.HORIZN_S3_BUCKET_KEY,
    secretAccessKey: process.env.HORIZN_S3_BUCKET_SECRET,
    region: packageJson.aws.bucket.region,
    params: {
      Bucket: packageJson.aws.bucket.name
    }
  };

function deployAwsTask(done) {

  var
    repository = require('../util/repository')(deployData),
    awspublish = require('../util/awspublish')(awsSettings, deployData);

  repository.getBranchData()
    .then(awspublish.upload)
    .then(done.bind(null, undefined))
    .catch(function (error) {
      console.log(error);
      throw error;
    });
}

module.exports = deployAwsTask;