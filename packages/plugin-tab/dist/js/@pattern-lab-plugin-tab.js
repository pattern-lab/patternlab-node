// workaround to `PluginTab undefined` error in Safari
window.PluginTab = {
  /**
   * The function defined as the onready callback within the plugin configuration.
   */
  init: function() {
    //placeholder that will be replaced during configuation
    //most plugins could probably just implement logic here instead.
    function addPanels() {
      /*SNIPPETS*/
    }

    // workaround to try recovering from load order race conditions
    if (window.patternlab && window.patternlab.panels) {
      addPanels();
    } else {
      document.addEventListener('patternLab.pageLoad', addPanels);
    }
  },
};
