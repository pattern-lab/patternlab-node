/* global Panels */

Panels.add({
  'id': 'sg-panel-<<type>>',
  'name': '<<typeUC>>',
  'default': false,
  'templateID': 'pl-panel-template-code',
  'httpRequest': true,
  'httpRequestReplace': '.<<type>>',
  'httpRequestCompleted': false,
  'prismHighlight': true,
  'language': 'markup',
  'keyCombo': 'ctrl+shift+z'
});
