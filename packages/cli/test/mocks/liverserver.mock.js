function liveServerMock() {
  return {
    reload: function() {
      return true;
    },
    refreshCSS: function() {
      return true;
    },
    start: function() {
      return true;
    },
  };
}

module.exports = liveServerMock;
