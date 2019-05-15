function patternLabMock() {
  return {
    build: function() {
      return true;
    },
    help: function() {
      return true;
    },
    patternsonly: function() {
      return true;
    },
    liststarterkits: function() {
      return true;
    },
    loadstarterkit: function() {
      return true;
    },
  };
}

module.exports = patternLabMock;
