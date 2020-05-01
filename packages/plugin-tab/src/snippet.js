window.patternlab.panels.add({
  id: 'sg-panel-<<type>>',
  name: '<<typeUC>>',
  default: window.config.defaultPatternInfoPanelCode && window.config.defaultPatternInfoPanelCode === "<<type>>",
  templateID: 'pl-panel-template-code',
  httpRequest: true,
  httpRequestReplace: '.<<type>>',
  httpRequestCompleted: false,
  prismHighlight: true,
  language: '<<type>>'//,
  /* TODO: We would need to find a way to enable keyCombo for multiple panels
  keyCombo: 'ctrl+shift+z',*/
});
