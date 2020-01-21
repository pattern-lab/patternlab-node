// workaround to `PluginTab undefined` error in Safari
window.PluginTab = {
  /**
   * The function defined as the onready callback within the plugin configuration.
   */
  init: function() {
    //placeholder that will be replaced during configuation
    //most plugins could probably just implement logic here instead.
    /*SNIPPETS*/
  },
};
