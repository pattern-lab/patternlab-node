module.exports = function(config) {
  // Layout aliases
  config.addLayoutAlias('home', 'layouts/home.njk');

  // Passthrough copy
  config.addPassthroughCopy('src/fonts');

  return {
    dir: {
      input: 'src',
      output: 'dist'
    },
    passthroughFileCopy: true
  };
};
