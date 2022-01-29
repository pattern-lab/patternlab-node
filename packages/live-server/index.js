#!/usr/bin/env node
const fs = require('fs');
const connect = require('connect');
const serveIndex = require('serve-index');
const logger = require('morgan');
const WebSocket = require('faye-websocket');
const path = require('path');
const url = require('url');
const http = require('http');
const send = require('send');
const open = require('open');
const es = require('event-stream');
const os = require('os');
const chokidar = require('chokidar');

require('colors');

const INJECTED_CODE = fs.readFileSync(
  path.join(__dirname, 'injected.html'),
  'utf8'
);

const LiveServer = {
  server: null,
  watcher: null,
  logLevel: 2,
};

function escape(html) {
  return String(html)
    .replace(/&(?!\w+;)/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

// Based on connect.static(), but streamlined and with added code injecter
function staticServer(root) {
  let isFile = false;
  try {
    // For supporting mounting files instead of just directories
    isFile = fs.statSync(root).isFile();
  } catch (e) {
    if (e.code !== 'ENOENT') throw e;
  }
  return function (req, res, next) {
    if (req.method !== 'GET' && req.method !== 'HEAD') return next();

    const reqpath = isFile ? '' : url.parse(req.url).pathname;
    const hasNoOrigin = !req.headers.origin;
    const injectCandidates = [
      new RegExp('</body>', 'i'),
      new RegExp('</head>', 'i'),
    ];

    let injectTag = null;
    let injectCount = 0;

    function directory() {
      const pathname = url.parse(req.originalUrl).pathname;
      res.statusCode = 301;
      res.setHeader('Location', pathname + '/');
      res.end('Redirecting to ' + escape(pathname) + '/');
    }

    function file(filepath /*, stat*/) {
      const x = path.extname(filepath).toLocaleLowerCase();
      const possibleExtensions = [
        '',
        '.html',
        '.htm',
        '.xhtml',
        '.php',
        '.svg',
      ];

      let matches;
      if (hasNoOrigin && possibleExtensions.indexOf(x) > -1) {
        // TODO: Sync file read here is not nice, but we need to determine if the html should be injected or not
        const contents = fs.readFileSync(filepath, 'utf8');
        for (let i = 0; i < injectCandidates.length; ++i) {
          matches = contents.match(injectCandidates[i]);
          injectCount = (matches && matches.length) || 0;
          if (injectCount) {
            injectTag = matches[0];
            break;
          }
        }

        if (injectTag === null && LiveServer.logLevel >= 3) {
          console.warn(
            'Failed to inject refresh script!'.yellow,
            "Couldn't find any of the tags ",
            injectCandidates,
            'from',
            filepath
          );
        }
      }
    }

    function error(err) {
      if (err.status === 404) return next();
      return next(err);
    }

    function inject(stream) {
      if (injectTag) {
        // We need to modify the length given to browser
        const len =
          INJECTED_CODE.length * injectCount + res.getHeader('Content-Length');
        res.setHeader('Content-Length', len);

        const originalPipe = stream.pipe;
        stream.pipe = function (resp) {
          originalPipe
            .call(
              stream,
              es.replace(new RegExp(injectTag, 'i'), INJECTED_CODE + injectTag)
            )
            .pipe(resp);
        };
      }
    }

    return send(req, reqpath, { root: root })
      .on('error', error)
      .on('directory', directory)
      .on('file', file)
      .on('stream', inject)
      .pipe(res);
  };
}

/**
 * Rewrite request URL and pass it back to the static handler.
 * @param staticHandler {function} Next handler
 * @param file {string} Path to the entry point file
 */
function entryPoint(staticHandler, file) {
  if (!file)
    return function (req, res, next) {
      next();
    };

  return function (req, res, next) {
    req.url = '/' + file;
    staticHandler(req, res, next);
  };
}

/**
 * Start a live server with parameters given as an object
 * @param host {string} Address to bind to (default: 0.0.0.0)
 * @param port {number} Port number (default: 8080)
 * @param root {string} Path to root directory (default: cwd)
 * @param watch {array} Paths to exclusively watch for changes
 * @param ignore {array} Paths to ignore when watching files for changes
 * @param ignorePattern {regexp} Ignore files by RegExp
 * @param noCssInject Don't inject CSS changes, just reload as with any other file change
 * @param open {(string|string[])} Subpath(s) to open in browser, use false to suppress launch (default: server root)
 * @param mount {array} Mount directories onto a route, e.g. [['/components', './node_modules']].
 * @param logLevel {number} 0 = errors only, 1 = some, 2 = lots
 * @param file {string} Path to the entry point file
 * @param wait {number} Server will wait for all changes, before reloading
 * @param htpasswd {string} Path to htpasswd file to enable HTTP Basic authentication
 * @param middleware {array} Append middleware to stack, e.g. [function(req, res, next) { next(); }].
 * @param assets {String[]} path of asset directories to watch
 */
LiveServer.start = function (options) {
  const host = options.host || '0.0.0.0';
  const port = options.port !== undefined ? options.port : 8080; // 0 means random
  const root = options.root || process.cwd();
  const mount = options.mount || [];
  const watchPaths =
    options.watch || (options.assets ? [root, ...options.assets] : [root]);
  LiveServer.logLevel = options.logLevel === undefined ? 2 : options.logLevel;

  let openPath =
    options.open === undefined || options.open === true
      ? ''
      : options.open === null || options.open === false
      ? null
      : options.open;
  if (options.noBrowser) openPath = null; // Backwards compatibility with 0.7.0

  const file = options.file;
  const staticServerHandler = staticServer(root);
  const wait = options.wait === undefined ? 100 : options.wait;
  const browser = options.browser || null;
  const htpasswd = options.htpasswd || null;
  const cors = options.cors || false;
  const https = options.https || null;
  const proxy = options.proxy || [];
  const middleware = options.middleware || [];
  const noCssInject = options.noCssInject;
  let httpsModule = options.httpsModule;

  if (httpsModule) {
    try {
      require.resolve(httpsModule);
    } catch (e) {
      console.error(
        `HTTPS module "${httpsModule}" you've provided was not found.`.red
      );
      console.error('Did you do', `"npm install ${httpsModule}"?`);
      return;
    }
  } else {
    httpsModule = 'https';
  }

  // Setup a web server
  const app = connect();

  // Add logger. Level 2 logs only errors
  if (LiveServer.logLevel === 2) {
    app.use(
      logger('dev', {
        skip: function (req, res) {
          return res.statusCode < 400;
        },
      })
    );
    // Level 2 or above logs all requests
  } else if (LiveServer.logLevel > 2) {
    app.use(logger('dev'));
  }

  if (options.spa) {
    middleware.push('spa');
  }

  // Add middleware
  middleware.map((mw) => {
    let mwm = mw;
    if (typeof mw === 'string') {
      if (path.extname(mw).toLocaleLowerCase() !== '.js') {
        mwm = require(path.join(__dirname, 'middleware', mw + '.js'));
      } else {
        mwm = require(mw);
      }
    }
    app.use(mwm);
  });

  // Use http-auth if configured
  if (htpasswd !== null) {
    const auth = require('http-auth');
    const authConnect = require('http-auth-connect');
    const basic = auth.basic({
      realm: 'Please authorize',
      file: htpasswd,
    });
    app.use(authConnect(basic));
  }

  if (cors) {
    app.use(
      require('cors')({
        origin: true, // reflecting request origin
        credentials: true, // allowing requests with credentials
      })
    );
  }

  mount.forEach((mountRule) => {
    const mountPath = path.resolve(process.cwd(), mountRule[1]);
    if (!options.watch) {
      // Auto add mount paths to wathing but only if exclusive path option is not given
      watchPaths.push(mountPath);
    }

    app.use(mountRule[0], staticServer(mountPath));
    if (LiveServer.logLevel >= 1) {
      console.log('Mapping %s to "%s"', mountRule[0], mountPath);
    }
  });

  proxy.forEach((proxyRule) => {
    const proxyOpts = url.parse(proxyRule[1]);
    proxyOpts.via = true;
    proxyOpts.preserveHost = true;
    app.use(proxyRule[0], require('proxy-middleware')(proxyOpts));

    if (LiveServer.logLevel >= 1) {
      console.log('Mapping %s to "%s"', proxyRule[0], proxyRule[1]);
    }
  });

  app
    .use(staticServerHandler) // Custom static server
    .use(entryPoint(staticServerHandler, file))
    .use(serveIndex(root, { icons: true }));

  let server, protocol;
  if (https !== null) {
    let httpsConfig = https;
    if (typeof https === 'string') {
      httpsConfig = require(path.resolve(process.cwd(), https));
    }

    server = require(httpsModule).createServer(httpsConfig, app);
    protocol = 'https';
  } else {
    server = http.createServer(app);
    protocol = 'http';
  }

  // Handle server startup errors
  server.addListener('error', function (e) {
    if (e.code === 'EADDRINUSE') {
      console.log(
        '%s is already in use. Trying another port.'.yellow,
        `${protocol}://${host}:${port}`
      );
      setTimeout(function () {
        server.listen(0, host);
      }, 1000);
    } else {
      console.error(e.toString().red);
      LiveServer.shutdown();
    }
  });

  // Handle successful server
  server.addListener('listening', function (/*e*/) {
    LiveServer.server = server;

    const address = server.address();
    const serveHost =
      address.address === '0.0.0.0' ? '127.0.0.1' : address.address;
    const openHost = host === '0.0.0.0' ? '127.0.0.1' : host;

    const serveURL = `${protocol}://${serveHost}:${address.port}`;
    const openURL = `${protocol}://${openHost}:${address.port}`;

    let serveURLs = [serveURL];
    if (LiveServer.logLevel > 2 && address.address === '0.0.0.0') {
      const ifaces = os.networkInterfaces();
      serveURLs = Object.keys(ifaces)
        .map((iface) => ifaces[iface])
        // flatten address data, use only IPv4
        .reduce((data, addresses) => {
          addresses
            .filter((addr) => addr.family === 'IPv4')
            .forEach((addr) => data.push(addr));
          return data;
        }, [])
        .map((addr) => `${protocol}://${addr.address}:${address.port}`);
    }

    // Output
    if (LiveServer.logLevel >= 1) {
      if (serveURL === openURL)
        if (serveURLs.length === 1) {
          console.log('Serving "%s" at %s'.green, root, serveURLs[0]);
        } else {
          console.log(
            'Serving "%s" at\n\t%s'.green,
            root,
            serveURLs.join('\n\t')
          );
        }
      else
        console.log('Serving "%s" at %s (%s)'.green, root, openURL, serveURL);
    }

    // Launch browser
    if (openPath !== null)
      if (typeof openPath === 'object') {
        openPath.forEach((p) =>
          open(openURL + p, { app: { name: browser } }).catch(() =>
            console.log(
              'Warning: Could not open pattern lab in default browser.'
            )
          )
        );
      } else {
        open(openURL + openPath, { app: { name: browser } }).catch(() =>
          console.log('Warning: Could not open pattern lab in default browser.')
        );
      }
  });

  // Setup server to listen at port
  server.listen(port, host);

  // WebSocket
  let clients = [];
  server.addListener('upgrade', function (request, socket, head) {
    const ws = new WebSocket(request, socket, head);
    ws.onopen = function () {
      ws.send('connected');
    };

    if (wait > 0) {
      (function () {
        const wssend = ws.send;
        let waitTimeout;
        ws.send = function () {
          const args = arguments;
          if (waitTimeout) clearTimeout(waitTimeout);
          waitTimeout = setTimeout(function () {
            wssend.apply(ws, args);
          }, wait);
        };
      })();
    }

    ws.onclose = function () {
      clients = clients.filter((x) => x !== ws);
    };

    clients.push(ws);
  });

  let ignored = [
    function (testPath) {
      // Always ignore dotfiles (important e.g. because editor hidden temp files)
      return (
        testPath !== '.' && /(^[.#]|(?:__|~)$)/.test(path.basename(testPath))
      );
    },
  ];

  if (options.ignore) {
    ignored = ignored.concat(options.ignore);
  }

  if (options.ignorePattern) {
    ignored.push(options.ignorePattern);
  }

  // Setup file watcher
  LiveServer.watcher = chokidar.watch(
    // Replace backslashes with slashes, because chokidar pattern
    // like path/**/*.xyz only acceps linux file path
    watchPaths.map((p) => p.replace(/\\/g, '/')),
    {
      ignored: ignored,
      ignoreInitial: true,
      awaitWriteFinish: true,
    }
  );

  function handleChange(changePath) {
    const cssChange = path.extname(changePath) === '.css' && !noCssInject;
    if (LiveServer.logLevel >= 1) {
      if (cssChange) console.log('CSS change detected'.magenta, changePath);
      else console.log('Change detected'.cyan, changePath);
    }

    clients.forEach((ws) => {
      if (ws) ws.send(cssChange ? 'refreshcss' : 'reload');
    });
  }

  LiveServer.watcher
    .on('change', handleChange)
    .on('add', handleChange)
    .on('unlink', handleChange)
    .on('addDir', handleChange)
    .on('unlinkDir', handleChange)
    .on('ready', function () {
      if (LiveServer.logLevel >= 1) console.log('Ready for changes'.cyan);
    })
    .on('error', function (err) {
      console.log('ERROR:'.red, err);
    });

  LiveServer.refreshCSS = function () {
    if (clients.length) {
      clients.forEach((ws) => {
        if (ws) ws.send('refreshcss');
      });
    }
  };

  LiveServer.reload = function () {
    if (clients.length) {
      clients.forEach((ws) => {
        if (ws) ws.send('reload');
      });
    }
  };

  // server needs to get returned for the tests
  return server; // eslint-disable-line consistent-return
};

LiveServer.shutdown = function () {
  if (LiveServer.watcher) {
    LiveServer.watcher.close();
  }
  if (LiveServer.server) {
    LiveServer.server.close();
  }
};

module.exports = LiveServer;
