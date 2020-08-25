const cosmiconfig = require('cosmiconfig');

// find and load up the pattern lab configuration
async function findPatternLabConfig(configPath) {
  return new Promise(resolve => {
    const moduleName = 'patternlab';
    const explorer = cosmiconfig(moduleName, {
      searchPlaces: [
        'package.json',
        `.${moduleName}rc`,
        `.${moduleName}rc.json`,
        `.${moduleName}rc.yaml`,
        `.${moduleName}rc.yml`,
        `.${moduleName}rc.js`,
        `${moduleName}.config.js`,
        `${moduleName}.config.json`,
      ],
    });

    // if a config path is provided, try to load that up. otherwise recursively search
    if (configPath) {
      return explorer
        .load(configPath)
        .then(result => {
          const config = result.config;
          config.filepath = result.filepath;
          resolve(config);
          // result.config is the parsed configuration object.
          // result.filepath is the path to the config file that was found.
          // result.isEmpty is true if there was nothing to parse in the config file.
        })
        .catch(error => {
          console.log(error);
          // Do something constructive.
        });
    } else {
      return explorer
        .search()
        .then(result => {
          const config = result.config;
          config.filepath = result.filepath;
          resolve(config);
          // result.config is the parsed configuration object.
          // result.filepath is the path to the config file that was found.
          // result.isEmpty is true if there was nothing to parse in the config file.
        })
        .catch(error => {
          console.log(error);
          // Do something constructive.
        });
    }
  });
}

module.exports = {
  findPatternLabConfig,
};
