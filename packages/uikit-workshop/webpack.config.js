// webpack.config.js
const CleanWebpackPlugin = require('clean-webpack-plugin');
const HardSourceWebpackPlugin = require('hard-source-webpack-plugin-patch');
const UglifyJsPlugin = require('uglifyjs-webpack-plugin');
const NoEmitPlugin = require('no-emit-webpack-plugin');
const autoprefixer = require('autoprefixer');
const CriticalCssPlugin = require('critical-css-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const selectorImporter = require('node-sass-selector-importer');
const PrerenderSPAPlugin = require('prerender-spa-plugin');
const CopyPlugin = require('copy-webpack-plugin');
const path = require('path');
const argv = require('yargs').argv;

const cosmiconfig = require('cosmiconfig');
const explorer = cosmiconfig('patternlab');

// @todo: wire these two ocnfigs up to use cosmicconfig!
const defaultConfig = {
  buildDir: './dist',
  prod: true, // or false for local dev
  sourceMaps: true,
  publicPath: './styleguide/',
  copy: [{ from: './src/images/**', to: 'images', flatten: true }],
};

module.exports = function() {
  return new Promise(async resolve => {
    let customConfig = defaultConfig;
    let configToSearchFor;

    if (argv.patternlabrc) {
      configToSearchFor = await explorer.loadSync(argv.patternlabrc);
    } else {
      configToSearchFor = await explorer.searchSync();
    }

    if (configToSearchFor) {
      if (configToSearchFor.config) {
        customConfig = configToSearchFor.config;
      }
    }

    // Allow external flags for modifying PL's prod mode, on top of the .patternlabrc config file
    const config = Object.assign({}, defaultConfig, customConfig);

    // organize the series of plugins to run our Sass through as an external array -- this is necessary since we need to add additional loaders when compiling Sass to standalone CSS files vs compiling Sass and returning an inline-able <style> block of CSS (which we need to do both)
    const scssLoaders = [
      {
        loader: 'css-loader',
        options: {
          sourceMap: config.sourceMaps,
        },
      },
      {
        loader: 'postcss-loader',
        options: {
          sourceMap: config.sourceMaps,
          plugins: () => [autoprefixer()],
        },
      },
      {
        loader: 'clean-css-loader',
        options: {
          compatibility: 'ie9',
          level: 1, // @todo: test bumping this up to 2
          inline: ['remote'],
        },
      },
      {
        loader: 'sass-loader',
        options: {
          sourceMap: config.sourceMaps,
          outputStyle: 'expanded',
          importer: [selectorImporter()],
        },
      },
    ];

    const webpackConfig = {
      entry: {
        'js/patternlab-pattern': './src/scripts/patternlab-pattern.js',
        'js/patternlab-viewer': './src/scripts/patternlab-viewer.js',
        'css/pattern-lab': './src/sass/pattern-lab.scss',
      },
      performance: {
        hints: false,
      },
      resolve: {
        extensions: ['.js', '.jsx'],
        alias: {
          react: path.resolve(__dirname, './src/scripts/utils/preact-compat'),
          'react-dom': 'preact-compat',
        },
      },
      output: {
        path: path.resolve(process.cwd(), `${config.buildDir}/styleguide`),
        publicPath: `${config.publicPath}`,
        filename: '[name].js',
        chunkFilename: `js/[name]-chunk-[chunkhash].js`,
      },
      module: {
        rules: [
          {
            test: /\.(ts|tsx)$/,
            use: [
              {
                loader: 'ts-loader',
                options: {
                  transpileOnly: true,
                  experimentalWatchApi: true,
                },
              },
            ],
          },
          {
            test: /\.html$/,
            use: [
              {
                loader: 'html-loader',
                options: {
                  interpolate: true,
                  minimize: config.prod ? true : false,
                  minifyCSS: false,
                  minifyJS: config.prod ? true : false,
                  // super important -- this prevents the embedded iframe srcdoc HTML from breaking!
                  preventAttributesEscaping: true,
                },
              },
            ],
          },
          {
            test: /\.js$/,
            exclude: /(bower_components)/,
            use: {
              loader: 'babel-loader',
              options: {
                presets: [
                  [
                    '@babel/preset-env',
                    {
                      targets: {
                        browsers: ['>0.25%', 'ie 11'],
                      },
                      modules: false,
                      debug: false,
                    },
                  ],
                ],
                plugins: [
                  [
                    '@babel/plugin-transform-runtime',
                    {
                      helpers: false,
                      regenerator: true,
                    },
                  ],
                  '@babel/plugin-proposal-optional-chaining',
                  ['@babel/plugin-proposal-decorators', { legacy: true }],
                  ['@babel/plugin-proposal-class-properties', { loose: true }],
                  '@babel/plugin-syntax-dynamic-import',
                  '@babel/plugin-syntax-jsx' /* [1] */,
                  [
                    '@babel/plugin-transform-react-jsx' /* [1] */,
                    {
                      pragma: 'h',
                      pragmaFrag: '"span"',
                      throwIfNamespace: false,
                      useBuiltIns: false,
                    },
                  ],
                ],
              },
            },
          },
          {
            test: /\.svg$/,
            use: [
              { loader: 'svg-sprite-loader', options: {} },
              'svg-transform-loader',
              'svgo-loader',
            ],
          },
          {
            test: /\.css$/,
            use: ['style-loader', 'css-loader'],
          },
          {
            test: /\.scss$/,
            oneOf: [
              {
                resourceQuery: /external/, // foo.scss?external
                use: [
                  {
                    loader: 'style-loader',
                    options: { injectType: 'lazyStyleTag' },
                  },
                  scssLoaders,
                ].reduce((acc, val) => acc.concat(val), []),
              },
              {
                // if .scss files are included by JS or HTML files, inline and don't spit out a file
                issuer: /(\.js$|\.html$)/,
                use: [scssLoaders].reduce((acc, val) => acc.concat(val), []),
              },
              {
                // otherwise extract the result and write out a .css file per usual
                use: [MiniCssExtractPlugin.loader, scssLoaders].reduce(
                  (acc, val) => acc.concat(val),
                  []
                ),
              },
            ],
          },
        ],
      },
      cache: true,
      // mode: config.prod ? 'production' : 'development',
      mode: 'development', // temp workaround till strange rendering issues with full `production` mode are switched on in Webpack
      optimization: {
        minimize: true,
        occurrenceOrder: true,
        namedChunks: true,
        removeAvailableModules: true,
        removeEmptyChunks: true,
        nodeEnv: 'production',
        mergeDuplicateChunks: true,
        concatenateModules: true,
        splitChunks: {
          chunks: 'async',
          cacheGroups: {
            vendors: {
              test: /[\\/]node_modules[\\/]/,
              name: 'vendors',
              chunks: 'async',
              reuseExistingChunk: true,
            },
          },
        },
        minimizer: config.prod
          ? [
              new UglifyJsPlugin({
                sourceMap: false,
                parallel: true,
                cache: true,
                uglifyOptions: {
                  compress: true,
                  mangle: true,
                  output: {
                    comments: false,
                    beautify: false,
                  },
                },
              }),
            ]
          : [],
      },
      plugins: [
        new CopyPlugin(config.copy),
        new PrerenderSPAPlugin({
          // Required - The path to the webpack-outputted app to prerender.
          // staticDir: path.join(__dirname, 'dist'),
          staticDir: path.resolve(process.cwd(), `${config.buildDir}/`),
          // Required - Routes to render.
          routes: ['/'],
          postProcess(context) {
            context.html = context.html.replace(
              /<script\s[^>]*charset=\"utf-8\"[^>]*><\/script>/gi,
              ''
            );
            return context;
          },
        }),
        // clear out the buildDir on every fresh Webpack build
        new CleanWebpackPlugin(
          [
            `${config.buildDir}/index.html`,
            `${config.buildDir}/styleguide/css`,
            `${config.buildDir}/styleguide/js`,
          ],
          {
            allowExternal: true,
            verbose: false,

            // perform clean just before files are emitted to the output dir
            beforeEmit: true,
          }
        ),
        new HtmlWebpackPlugin({
          filename: '../index.html',
          template: 'src/html/index.html',
          inject: false,
        }),
        new MiniCssExtractPlugin({
          filename: `[name].css`,
          chunkFilename: `[id].css`,
          allChunks: true,
        }),
        new NoEmitPlugin(['css/pattern-lab.js']),
      ],
    };

    webpackConfig.plugins.push(
      new HardSourceWebpackPlugin({
        info: {
          level: 'warn',
        },
        // Clean up large, old caches automatically.
        cachePrune: {
          // Caches younger than `maxAge` are not considered for deletion. They must
          // be at least this (default: 2 days) old in milliseconds.
          maxAge: 2 * 24 * 60 * 60 * 1000,
          // All caches together must be larger than `sizeThreshold` before any
          // caches will be deleted. Together they must be at least 300MB in size
          sizeThreshold: 300 * 1024 * 1024,
        },
      })
    );

    if (!argv.watch) {
      webpackConfig.plugins.push(
        new CriticalCssPlugin({
          base: path.resolve(__dirname, config.buildDir),
          src: 'index.html',
          dest: 'index.html',
          inline: true,
          minify: true,
          extract: false,
          width: 1300,
          height: 900,
          penthouse: {
            keepLargerMediaQueries: true,

            // @todo: troubleshoot why forceInclude works w/ Penthouse directly but not w/ Critical
            forceInclude: [
              'pl-logo',
              '.pl-c-logo',
              '.pl-c-logo__img',
              '.pl-c-body--theme-light',
              '.pl-c-body--theme-sidebar',
              '.pl-c-body--theme-sidebar .pl-c-viewport',
              '.pl-c-body--theme-density-compact',
            ],
            timeout: 30000, // ms; abort critical CSS generation after this timeout
            maxEmbeddedBase64Length: 1000,
            renderWaitTime: 1000,
            blockJSRequests: false,
          },
        })
      );
    }

    return resolve(webpackConfig);
  });
};
