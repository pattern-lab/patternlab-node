const fs = require('fs');
const path = require('path');
const penthouse = require('penthouse');

function buildCriticalCSS(cb) {
  penthouse({
    url: 'file:///' + __dirname + '/dist/index.html', // @todo: need to figure out dynamic port if serving page itself

    // the original css to extract critcial css from
    css: path.resolve(process.cwd(), 'dist/styleguide/css/pattern-lab.css'),

    // OPTIONAL params
    width: 1300, // viewport width
    height: 900, // viewport height

    // when true, will not filter out larger media queries
    keepLargerMediaQueries: true,

    // selectors to keep
    forceInclude: [
      // '.my-selector',
      '.pl-c-body--theme-light',
      '.pl-c-body--theme-sidebar',
      '.pl-c-body--theme-sidebar .pl-c-viewport',
      '.pl-c-body--theme-density-compact',
      // /^\.regexWorksToo/
    ],
    propertiesToRemove: [
      '(.*)transition(.*)',
      'cursor',
      'pointer-events',
      '(-webkit-)?tap-highlight-color',
      '(.*)user-select',
    ],
    timeout: 30000, // ms; abort critical CSS generation after this timeout
    pageLoadSkipTimeout: 0, // ms; stop waiting for page load after this timeout (for sites with broken page load event timings)
    maxEmbeddedBase64Length: 1000, // characters; strip out inline base64 encoded resources larger than this
    userAgent: 'Penthouse Critical Path CSS Generator', // specify which user agent string when loading the page
    renderWaitTime: 1000, // ms; render wait timeout before CSS processing starts (default: 100)
    blockJSRequests: false, // set to false to load (external) JS (default: true)
    customPageHeaders: {
      'Accept-Encoding': 'identity', // add if getting compression errors like 'Data corrupted'
    },
    strict: false, // set to true to throw on CSS errors
    puppeteer: {
      getBrowser: undefined, // A function that resolves with a puppeteer browser to use instead of launching a new browser session
    },
  })
    .then(function(criticalCss) {
      fs.writeFileSync(
        path.resolve(
          process.cwd(),
          'dist/styleguide/css/pattern-lab.critical.css'
        ),
        criticalCss
      );
      cb();
    })
    .catch(err => {
      console.log(err); // handle any errors thrown
    });
}

module.exports = {
  buildCriticalCSS,
};
