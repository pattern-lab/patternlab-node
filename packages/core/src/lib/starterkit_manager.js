'use strict';

const starterkit_manager = function (config) {
  const path = require('path');
  const fetch = require('node-fetch');
  const fs = require('fs-extra');
  const logger = require('./log');
  const paths = config.paths;

  /**
   * Loads npm module identified by the starterkitName parameter.
   *
   * @param starterkitName {string} Kit name
   * @param clean {boolean}  Indicates if the directory should be cleaned before loading
   */
  function loadStarterKit(starterkitName, clean) {
    try {
      const kitPath = path.resolve(
        path.join(
          process.cwd(),
          'node_modules',
          starterkitName,
          config.starterkitSubDir
        )
      );
      logger.debug('Attempting to load starterkit from', kitPath);
      let kitDirStats;
      try {
        kitDirStats = fs.statSync(kitPath);
      } catch (ex) {
        logger.warning(
          `${starterkitName} not found, use npm or another package manager to install it first.`
        );
        logger.warning(`${starterkitName} not loaded.`);
        return;
      }
      const kitPathDirExists = kitDirStats.isDirectory();
      if (kitPathDirExists) {
        if (clean) {
          logger.info(
            `Deleting contents of ${paths.source.root} prior to starterkit load.`
          );
          fs.emptyDirSync(paths.source.root);
        } else {
          logger.info(
            `Overwriting contents of ${paths.source.root} during starterkit load.`
          );
        }

        try {
          fs.copySync(kitPath, paths.source.root);
        } catch (ex) {
          logger.error(ex);
          return;
        }
        logger.info('Starterkit ' + starterkitName + ' loaded into source/.');
      }
    } catch (ex) {
      logger.warning(
        `An error occurred during starterkit installation for starterkit ${starterkitName}`
      );
      logger.warning(ex);
    }
  }

  /**
   * Fetches starterkit repos from GH API that contain 'starterkit' in their name for the user 'pattern-lab'
   *
   * @return {Promise} Returns an Array<{name,url}> for the starterkit repos
   */
  function listStarterkits() {
    return fetch(
      'https://api.github.com/search/repositories?q=starterkit+in:name+user:pattern-lab&sort=stars&order=desc',
      {
        method: 'GET',
        headers: {
          Accept: 'application/json',
        },
      }
    )
      .then(function (res) {
        const contentType = res.headers.get('content-type');
        if (contentType && contentType.indexOf('application/json') === -1) {
          throw new TypeError(
            'StarterkitManager->listStarterkits: Not valid JSON'
          );
        }
        return res.json();
      })
      .then(function (json) {
        if (!json.items || !Array.isArray(json.items)) {
          return false;
        }
        return json.items.map(function (repo) {
          return { name: repo.name, url: repo.html_url };
        });
      })
      .catch(function (err) {
        logger.error(err);
        return false;
      });
  }

  function packStarterkit() {}

  /**
   * Detects installed starter kits
   *
   * @return {array} List of starter kits installed
   */
  //TODO review for deletion or convert callers to use findModules()
  function detectStarterKits() {
    const node_modules_path = path.join(process.cwd(), 'node_modules');
    const npm_modules = fs
      .readdirSync(node_modules_path)
      .filter(function (dir) {
        const module_path = path.join(process.cwd(), 'node_modules', dir);
        return (
          fs.statSync(module_path).isDirectory() &&
          dir.indexOf('starterkit-') === 0
        );
      });
    return npm_modules;
  }

  return {
    load_starterkit: function (starterkitName, clean) {
      loadStarterKit(starterkitName, clean);
    },
    list_starterkits: function () {
      return listStarterkits();
    },
    pack_starterkit: function () {
      packStarterkit();
    },
    detect_starterkits: function () {
      return detectStarterKits();
    },
  };
};

module.exports = starterkit_manager;
