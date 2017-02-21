'use strict';

const pluginName = 'plugin-node-tab';

const fs = require('fs-extra');
const glob = require('glob');
const path = require('path');
const EOL = require('os').EOL;
const tab_loader = require('./src/tab-loader');
const config = require('./config.json');

function writeConfigToOutput(patternlab, pluginConfig) {
  var pluginConfigPathName = path.resolve(patternlab.config.paths.public.root, 'patternlab-components', 'packages');
  try {
    fs.outputFileSync(pluginConfigPathName + '/' + pluginName + '.json', JSON.stringify(pluginConfig, null, 2));
  } catch (ex) {
    console.trace(pluginName + ': Error occurred while writing pluginFile configuration');
    console.log(ex);
  }
}

function onPatternIterate(patternlab, pattern) {
  tab_loader(patternlab, pattern);
}

/**
 * Define what events you wish to listen to here
 * For a full list of events - check out https://github.com/pattern-lab/patternlab-node/wiki/Creating-Plugins#events
 * @param patternlab - global data store which has the handle to the event emitter
   */
function registerEvents(patternlab) {
  //register our handler at the appropriate time of execution
  patternlab.events.on('patternlab-pattern-write-end', onPatternIterate);
}

/**
* A single place to define the frontend configuration
* This configuration is outputted to the frontend explicitly as well as included in the plugins object.
*
*/
function getPluginFrontendConfig() {
  return {
    'name':'pattern-lab\/' + pluginName,
    'templates':[],
    'stylesheets':[],
    'javascripts':['patternlab-components\/pattern-lab\/' + pluginName + '\/js\/' + pluginName + '.js'],
    'onready':'PluginTab.init()',
    'callback':''
  }
}

/**
* The entry point for the plugin. You should not have to alter this code much under many circumstances.
* Instead, alter getPluginFrontendConfig() and registerEvents() methods
  */
function pluginInit(patternlab) {

  if (!patternlab) {
    console.error('patternlab object not provided to plugin-init');
    process.exit(1);
  }

  //write the plugin json to public/patternlab-components
  var pluginConfig = getPluginFrontendConfig();
  pluginConfig.tabsToAdd = patternlab.config.plugins[pluginName].options.tabsToAdd;
  writeConfigToOutput(patternlab, pluginConfig);

  var pluginConfigPathName = path.resolve(patternlab.config.paths.public.root, 'patternlab-components', 'packages');
  try {
    fs.outputFileSync(pluginConfigPathName + '/' + pluginName + '.json', JSON.stringify(pluginConfig, null, 2));
  } catch (ex) {
    console.trace('plugin-node-tab: Error occurred while writing pluginFile configuration');
    console.log(ex);
  }

  //add the plugin config to the patternlab-object
  if (!patternlab.plugins) {
    patternlab.plugins = [];
  }
  patternlab.plugins.push(pluginConfig);

  //write the plugin dist folder to public/pattern-lab
  var pluginFiles = glob.sync(__dirname + '/dist/**/*');

  if (pluginFiles && pluginFiles.length > 0) {

    let tab_frontend_snippet = fs.readFileSync(path.resolve(__dirname + '/src/snippet.js'), 'utf8');

    for (let i = 0; i < pluginFiles.length; i++) {
      try {
        var fileStat = fs.statSync(pluginFiles[i]);
        if (fileStat.isFile()) {
          var relativePath = path.relative(__dirname, pluginFiles[i]).replace('dist', ''); //dist is dropped
          var writePath = path.join(patternlab.config.paths.public.root, 'patternlab-components', 'pattern-lab', pluginName, relativePath);

          //a message to future plugin authors:
          //depending on your plugin's job - you might need to alter the dist file instead of copying.
          //if you are simply copying dist files, you can probably do the below:
          //fs.copySync(pluginFiles[i], writePath);

          //in this case, we need to alter the dist file to loop through our tabs to load as defined in the package.json
          //we are also being a bit lazy here, since we only expect one file
          let tabJSFileContents = fs.readFileSync(pluginFiles[i], 'utf8');
          var snippetString = '';
          for (let j = 0; j < pluginConfig.tabsToAdd.length; j++) {
            let tabSnippetLocal = tab_frontend_snippet.replace(/<<type>>/g, pluginConfig.tabsToAdd[j]).replace(/<<typeUC>>/g, pluginConfig.tabsToAdd[j].toUpperCase());
            snippetString += tabSnippetLocal + EOL;
          }
          tabJSFileContents = tabJSFileContents.replace('/*SNIPPETS*/', snippetString);
          fs.outputFileSync(writePath, tabJSFileContents);
        }
      } catch (ex) {
        console.trace('plugin-node-tab: Error occurred while copying pluginFile', pluginFiles[i]);
        console.log(ex);
      }
    }
  }

  //setup listeners if not already active. we also enable and set the plugin as initialized
  if (!patternlab.config.plugins) {
    patternlab.config.plugins = {};
  }

  //attempt to only register events once
  if (patternlab.config.plugins[pluginName] !== undefined &&
     patternlab.config.plugins[pluginName].enabled &&
     !patternlab.config.plugins[pluginName].initialized) {

    //register events
    registerEvents(patternlab);

    //set the plugin initialized flag to true to indicate it is installed and ready
    patternlab.config.plugins[pluginName].initialized = true;
  }

}

module.exports = pluginInit;
