/**
 * Default Panels for Pattern Lab plus Panel related events
 *
 * note: config is coming from the default viewer and is passed through from PL's config
 */

import { PrismLanguages } from './prism-languages';
import { Dispatcher } from '../utils';

export const Panels = {
  panels: [],

  count() {
    return this.panels.length;
  },

  get() {
    return JSON.parse(JSON.stringify(Panels.panels));
  },

  add(panel) {
    // if ID already exists in panels array ignore the add()
    for (let i = 0; i < this.panels.length; ++i) {
      if (panel.id === this.panels[i].id) {
        return;
      }
    }

    // it wasn't found so push the tab onto the tabs
    this.panels.push(panel);
  },

  remove(id) {
    const panels = this.panels;
    for (let i = panels.length - 1; i >= 0; i--) {
      if (panels[i].id === id) {
        const panelToRemove = panels[i];
        panels.splice(i, 1);
        //if removed panel was default, set first panel as new default, if exists
        if (panelToRemove.default && panels.length) {
          panels[0].default = true;
        }
        return; //should be no more panels with the same id
      }
    }
  },
};

function receiveIframeMessage(event) {
  // does the origin sending the message match the current host? if not dev/null the request
  if (
    (window.location.protocol !== 'file:' &&
      event.origin !==
        window.location.protocol + '//' + window.location.host) ||
    event.data === '' // message received, but no data included; prevents JSON.parse error below
  ) {
    return;
  }

  let data = {};
  try {
    data = typeof event.data !== 'string' ? event.data : JSON.parse(event.data);
  } catch (e) {
    // @todo: how do we want to handle exceptions here?
  }

  if (data.event !== undefined) {
    if (data.event === 'patternLab.pageLoad') {
      const fileSuffixPattern =
        window.config.outputFileSuffixes !== undefined &&
        window.config.outputFileSuffixes.rawTemplate !== undefined
          ? window.config.outputFileSuffixes.rawTemplate
          : '';

      const fileSuffixMarkup =
        window.config.outputFileSuffixes !== undefined &&
        window.config.outputFileSuffixes.markupOnly !== undefined
          ? window.config.outputFileSuffixes.markupOnly
          : '.markup-only';

      // add the default panels
      // Panels.add({ 'id': 'pl-panel-info', 'name': 'info', 'default': true, 'templateID': 'pl-panel-template-info', 'httpRequest': false, 'prismHighlight': false, 'keyCombo': '' });
      // TODO: sort out pl-panel-html
      Panels.add({
        id: 'pl-panel-pattern',
        name: window.config.patternExtension.toUpperCase(),
        default: true,
        templateID: 'pl-panel-template-code',
        httpRequest: true,
        httpRequestReplace: fileSuffixPattern,
        httpRequestCompleted: false,
        prismHighlight: true,
        language: PrismLanguages.get(window.config.patternExtension),
        keyCombo: 'ctrl+shift+u',
      });

      Panels.add({
        id: 'pl-panel-html',
        name: 'HTML',
        default: false,
        templateID: 'pl-panel-template-code',
        httpRequest: true,
        httpRequestReplace: fileSuffixMarkup + '.html',
        httpRequestCompleted: false,
        prismHighlight: true,
        language: 'markup',
        keyCombo: 'ctrl+shift+y',
      });
    }
  }
}

// gather panels from plugins
Dispatcher.trigger('setupPanels');

window.addEventListener('message', receiveIframeMessage, false);
