/* global Panels */

window.patternlab.panels.add({
  id: 'sg-panel-<<type>>',
  name: '<<typeUC>>',
  default: false,
  templateID: 'pl-panel-template-code',
  httpRequest: true,
  httpRequestReplace: '.<<type>>',
  httpRequestCompleted: false,
  prismHighlight: true,
  language: '<<type>>',
  keyCombo: 'ctrl+shift+z',
});
