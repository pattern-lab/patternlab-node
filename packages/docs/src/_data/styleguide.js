const tokens = require('./tokens.json');

module.exports = {
  colors() {
    let response = [];

    Object.keys(tokens.colors).forEach(key => {
      response.push({
        value: tokens.colors[key],
        key
      });
    });

    return response;
  },
  sizes() {
    let response = [];

    Object.keys(tokens['size-scale']).forEach(key => {
      response.push({
        value: tokens['size-scale'][key],
        key
      });
    });

    return response;
  }
};
