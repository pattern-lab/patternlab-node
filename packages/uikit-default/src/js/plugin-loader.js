/*!
 * Plugin Loader
 *
 * Copyright (c) 2015 Dave Olsen, http://dmolsen.com
 * Licensed under the MIT license
 *
 * Takes the assets they can be loaded for plugins and adds them to the DOM
 *
 * @requires styleguide.js
 *
 */

var pluginLoader = {
  
  init: function () {
    
    var s, t, l, c, n;
    
    for (var i = 0; i < plugins.length; ++i) {
      
      var plugin = plugins[i];
      
      // load the templates
      for (var key in plugin.templates) {
        if (plugin.templates.hasOwnProperty(key)) {
          t           = document.getElementsByTagName('script');
          l           = t.length - 1;
          s           = t[l];
          n           = document.createElement('script');
          n.type      = 'text/mustache';
          n.id        = plugin.name.replace("\/","-")+"-"+key+"-template";
          n.innerHTML = plugin.templates[key];
          s.parentNode.insertBefore(n, s.nextSibling);
        }
      }
      
      // load the stylesheets
      for (var k = 0; k < plugin.stylesheets.length; ++k) {
        s       = plugin.stylesheets[k];
        t       = document.getElementsByTagName('link');
        l       = t.length - 1;
        c       = t[l];
        n       = document.createElement('link');
        n.type  = 'text/css';
        n.rel   = 'stylesheet';
        n.href  = 'patternlab-components/'+plugin.name+'/'+s;
        n.media = 'screen';
        c.parentNode.insertBefore(n, c.nextSibling);
      }
      
      // load the javascript
      // $script.path('patternlab-components/'+plugin.name+'/');
      $script(plugin.javascripts, plugin.name, eval('(function() { '+plugin.callback+' })'));
      $script.ready([plugin.name], eval('(function() { '+plugin.onready+' })'));
      
    }
    
  }
  
};

pluginLoader.init();
