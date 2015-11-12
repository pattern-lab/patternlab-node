'use strict';

var
  util = require('gulp-util'),
  q = require('q'),

  deployData = {},
  namespace = 'styleguide',

  shopifySettings = {
    stage: {
      hostname: 'horizn-studios-test-environment.myshopify.com',
      auth: process.env.HORIZN_SHOPIFY_STAGE_AUTH
    },
    //prod: {
    //  hostname: 'horizn-studios.myshopify.com',
    //  auth: process.env.HORIZN_SHOPIFY_PRODUCTION_AUTH
    //}
  };

function notifyAboutNewVersionTask(done) {

  var
    repository = require('../util/repository')(deployData),
    shopify = require('../util/shopify')(deployData),
    kirby = require('../util/kirby')(deployData);

  repository.getBranchData()
    .then(function () {
      if (!deployData.isMaster) {
        util.log(util.colors.red("Cancel 'notifyAboutNewVersion', because we are not on branch 'master'."));
      }
    })
    .then(function () {
      if (deployData.isMaster) {
        return shopify.sendHasUpdatedNotification(namespace, shopifySettings.stage);
      }
    })
    .then(function () {
      if (deployData.isMaster) {
        return shopify.sendHasUpdatedNotification(namespace, shopifySettings.prod);
      }
    })
    .then(function () {
      if (deployData.isMaster) {
        return kirby.storeVersionOnKirbyInstance(namespace);
      }
    })
    .then(done.bind(null, undefined))
    .catch(function (error) {
      console.log(error);
      throw error;
    });
}

module.exports = notifyAboutNewVersionTask;