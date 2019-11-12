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

if (window.patternlab && window.patternlab.panels) {
  console.log('pl already ready');
  addPanels();
} else {
  console.log('waiting for PL to be ready');
  document.addEventListener('patternLab.pageLoad', addPanels);
}
