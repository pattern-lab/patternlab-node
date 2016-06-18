/*!
 * Default Panels for Pattern Lab plus Panel related events
 *
 * Copyright (c) 2016 Dave Olsen, http://dmolsen.com
 * Licensed under the MIT license
 *
 * config is coming from the default viewer and is passed through from PL's config
 *
 * @requires prism-languages.js
 */

var Panels = {
  
  panels: [],
  
  count: function() {
    return this.panels.length;
  },
  
  get: function() {
    return JSON.parse(JSON.stringify(this.panels));
  },
  
  add: function(panel) {
    
    // if ID already exists in panels array ignore the add()
    for (i = 0; i < this.panels.length; ++i) {
      if (panel.id === this.panels[i].id) {
        return;
      }
    }
    
    // it wasn't found so push the tab onto the tabs
    this.panels.push(panel);
    
  }
  
};

// add the default panels
// Panels.add({ 'id': 'sg-panel-info', 'name': 'info', 'default': true, 'templateID': 'pl-panel-template-info', 'httpRequest': false, 'prismHighlight': false, 'keyCombo': '' });
Panels.add({ 'id': 'sg-panel-pattern', 'name': config.patternExtension.toUpperCase(), 'default': true, 'templateID': 'pl-panel-template-code', 'httpRequest': true, 'httpRequestReplace': '.'+config.patternExtension, 'httpRequestCompleted': false, 'prismHighlight': true, 'language': PrismLanguages.get(config.patternExtension), 'keyCombo': 'ctrl+shift+u' });
Panels.add({ 'id': 'sg-panel-html', 'name': 'HTML', 'default': false, 'templateID': 'pl-panel-template-code', 'httpRequest': true, 'httpRequestReplace': '.markup-only.html', 'httpRequestCompleted': false, 'prismHighlight': true, 'language': 'markup', 'keyCombo': 'ctrl+shift+y' });

// gather panels from plugins
Dispatcher.trigger('setupPanels');
