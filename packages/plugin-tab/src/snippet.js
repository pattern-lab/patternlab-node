function addPanels() {
  window.patternlab.panels.add({
    id: 'sg-panel-scss',
    name: 'SCSS',
    default: false,
    templateID: 'pl-panel-template-code',
    httpRequest: true,
    httpRequestReplace: '.scss',
    httpRequestCompleted: false,
    prismHighlight: true,
    language: 'scss',
    keyCombo: 'ctrl+shift+z',
  });
}

// workaround to try recovering from load order race conditions
if (window.patternlab && window.patternlab.panels) {
  addPanels();
} else {
  document.addEventListener('patternLab.pageLoad', addPanels);
}
