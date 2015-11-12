'use strict';

var
  gulp = require('gulp'),
  q = require('q'),
  util = require('gulp-util'),
  https = require('https'),
  objectMerge = require('object-merge'),
  packageJson = require('../../package.json'),

  deployData = {},
  shopifySettings =  {},
  metafieldsApiEndpoint = packageJson.shopify.metafieldsApiEndpoint;

function requestToShopifyApi(options, deferred, body) {

  var defaultOptions = {
    hostname: shopifySettings.hostname,
    auth: shopifySettings.auth,
    path: metafieldsApiEndpoint + '.json',
    port: 443
  };
  options = objectMerge(defaultOptions, options);

  if (typeof options.query == 'string') {
    options.path += '?' + options.query;
  }

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
            //if (res.statusCode !== 200) throw body;
            deferred.resolve(body);
          }
          catch (error) {
            deferred.reject(error);
          }
        });
    });

  if (options.method === 'POST' || options.method === 'PUT') {
    req.write(body);
  }

  req.end();

  return deferred.promise;
}

function getStyleguideMetafields() {
  var
    deferred = q.defer(),
    options = {
      query: 'namespace=styleguide'
    };

  return requestToShopifyApi(options, deferred)
    .then(storeReceivedMetafields);
}

function storeReceivedMetafields(data) {
  shopifySettings.metafields = {};
  data.metafields.map(function (obj) {
    shopifySettings.metafields[obj['key']] = obj;
  })
}

function updateMetaField(metafieldKey, metafieldValue) {

  var
    metafieldId,
    deferred = q.defer(),

    body = JSON.stringify({
      metafield: {
        namespace: "styleguide",
        key: metafieldKey,
        value: metafieldValue,
        value_type: "string"
      }
    }),

    options = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
        'Accept': 'application/json',
        'Content-Length': body.length
      }
    };

  if (!!shopifySettings.metafields[metafieldKey]) {
    metafieldId = shopifySettings.metafields[metafieldKey].id;
    options.method = 'PUT';
    options.path = metafieldsApiEndpoint + '/' + metafieldId + '.json';
  }

  util.log(util.colors.green("Set metafield '" + metafieldKey + "' to '" +
    metafieldValue + "' of namespace 'frontend' on Shopify instance " +
    shopifySettings.hostname + "."));

  return requestToShopifyApi(options, deferred, body);
}

function updateStyleguideVersionMetaField() {
  return updateMetaField("version", deployData.version);
}

function updateStyleguideCommitMetaField() {
  return updateMetaField("commit", deployData.commit);
}

function sendStyleguideHasUpdatedNotification(sharedShopifySettings) {

  shopifySettings = sharedShopifySettings;

  return getStyleguideMetafields()
    .then(updateStyleguideVersionMetaField)
    .then(updateStyleguideCommitMetaField);
}

function shopifyConstructor(sharedDeployData) {

  deployData = sharedDeployData;

  return {
    sendStyleguideHasUpdatedNotification: sendStyleguideHasUpdatedNotification
  }
}

module.exports = shopifyConstructor;