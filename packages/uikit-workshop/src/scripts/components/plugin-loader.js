/**
 * Plugin Loader - takes the assets they can be loaded for plugins and adds them to the DOM
 */

// @todo: this entire approach needs to get MAJORLY refactored.
// At an absolute bare minimum we should be using off the shelf loadJS and loadCSS loaders for handling the async loading howe

const scriptjs = require('scriptjs');

export const pluginLoader = {
  init() {
    for (let i = 0; i < window.plugins.length; ++i) {
      const plugin = window.plugins[i];

      // load the templates
      for (const key in plugin.templates) {
        if (plugin.templates.hasOwnProperty(key)) {
          const t = document.getElementsByTagName('script');
          const l = t.length - 1;
          const s = t[l];
          const n = document.createElement('script');
          n.type = 'text/mustache';
          n.id = plugin.name.replace('/', '-') + '-' + key + '-template';
          n.innerHTML = plugin.templates[key];
          s.parentNode.insertBefore(n, s.nextSibling);
        }
      }

      // load the stylesheets
      for (let k = 0; k < plugin.stylesheets.length; ++k) {
        const s = plugin.stylesheets[k];
        const t = document.getElementsByTagName('link');
        const l = t.length - 1;
        const c = t[l];
        const n = document.createElement('link');
        n.type = 'text/css';
        n.rel = 'stylesheet';
        n.href = 'patternlab-components/' + plugin.name + '/' + s;
        n.media = 'screen';
        c.parentNode.insertBefore(n, c.nextSibling);
      }

      // load the javascript
      // $script.path('patternlab-components/'+plugin.name+'/');

      // @todo: remove evals when we refactor this entire approach
      scriptjs(
        plugin.javascripts,
        plugin.name,
        eval('(function() { ' + plugin.callback + ' })') // eslint-disable-line
      );
      scriptjs.ready(
        [plugin.name],
        eval('(function() { ' + plugin.onready + ' })') // eslint-disable-line
      );
    }
  },
};

pluginLoader.init();
