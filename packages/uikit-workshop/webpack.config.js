// webpack.config.js
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const TerserPlugin = require('terser-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const CopyPlugin = require('copy-webpack-plugin');
const path = require('path');
const argv = require('yargs').argv;
const { merge } = require('webpack-merge');
const WebpackBar = require('webpackbar');
const fs = require('node:fs');

const cosmiconfigSync = require('cosmiconfig').cosmiconfigSync;
const explorerSync = cosmiconfigSync('patternlab');

// @todo: wire these two ocnfigs up to use cosmicconfig!
const defaultConfig = {
  rootDir: process.cwd(),
  buildDir: './dist',
  prod: argv.watch ? false : true, // or false for local dev
  sourceMaps: true,
  watch: argv.watch ? true : false,
  publicPath: './styleguide/',
  copy: {
    patterns: [
      { from: '../uikit-workshop/src/images/**', to: 'images/[name][ext]' },
    ],
  },
  noViewAll: false,
};

// Requiring partials
// adapted from https://github.com/webpack-contrib/html-loader/issues/291#issuecomment-721909576
const INCLUDE_PATTERN = /\<include src=\"(.+)\"\/?\>(?:\<\/include\>)?/gi;
const processNestedHtml = (content, loaderContext) =>
  !INCLUDE_PATTERN.test(content)
    ? content
    : content.replace(INCLUDE_PATTERN, (m, src) =>
        processNestedHtml(
          fs.readFileSync(path.resolve(loaderContext.context, src), 'utf8'),
          loaderContext
        )
      );

module.exports = function (apiConfig) {
  return new Promise(async (resolve) => {
    let customConfig = defaultConfig;
    let configToSearchFor;

    if (argv.patternlabrc) {
      configToSearchFor = await explorerSync.load(argv.patternlabrc);
    } else {
      configToSearchFor = await explorerSync.search();
    }

    if (configToSearchFor) {
      if (configToSearchFor.config) {
        customConfig = configToSearchFor.config;
      }
    }

    // Allow external flags for modifying PL's prod mode, on top of the .patternlabrc config file
    const config = Object.assign({}, defaultConfig, customConfig, apiConfig);

    function getBabelConfig(isModern = false) {
      return {
        presets: [
          [
            '@babel/preset-env',
            {
              targets: {
                browsers: isModern
                  ? [
                      // NOTE: I'm not using the `esmodules` target due to this issue:
                      // https://github.com/babel/babel/issues/8809
                      'last 2 Chrome versions',
                      'last 2 Safari versions',
                      'last 2 iOS versions',
                      'last 2 Edge versions',
                      'Firefox ESR',
                    ]
                  : ['ie 11'],
              },
              useBuiltIns: 'entry',
              corejs: 3,
              modules: false,
              debug: false,
            },
          ],
        ],
        plugins: [
          '@babel/plugin-proposal-optional-chaining',
          ['@babel/plugin-proposal-decorators', { legacy: true }],
          ['@babel/plugin-proposal-class-properties', { loose: true }],
          ['@babel/plugin-proposal-private-methods', { loose: true }],
          [
            '@babel/plugin-proposal-private-property-in-object',
            { loose: true },
          ],
          '@babel/plugin-syntax-dynamic-import',
          '@babel/plugin-syntax-jsx' /* [1] */,
          [
            '@babel/plugin-transform-react-jsx' /* [1] */,
            {
              pragma: 'h',
              pragmaFrag: 'Fragment',
              throwIfNamespace: false,
              useBuiltIns: false,
            },
          ],
        ],
      };
    }

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
          postcssOptions: {
            plugins: [['autoprefixer', {}]],
          },
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
          sassOptions: {
            sourceMap: config.sourceMaps,
            outputStyle: 'expanded',
          },
        },
      },
    ];

    const webpackConfig = {
      stats: 'errors-warnings',
      performance: {
        hints: false,
      },
      resolve: {
        extensions: ['.js', '.jsx'],
        alias: {
          react: 'preact/compat',
          'react-dom/test-utils': 'preact/test-utils',
          'react-dom': 'preact/compat',
        },
      },
      output: {
        path: path.resolve(config.rootDir, `${config.buildDir}/styleguide`),
        publicPath: `${config.publicPath}`,
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
                  minimize: {
                    minifyCSS: false,
                    minifyJS: config.prod ? true : false,
                  },
                  preprocessor: processNestedHtml,
                },
              },
            ],
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
                    options: { injectType: 'lazySingletonStyleTag' },
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
      mode: config.prod ? 'production' : 'development',
      optimization: {
        minimize: config.prod,
        chunkIds: 'total-size',
        moduleIds: 'size',
        removeAvailableModules: true,
        removeEmptyChunks: true,
        nodeEnv: 'production',
        mergeDuplicateChunks: true,
        concatenateModules: true,
        splitChunks: {
          chunks: 'async',
          cacheGroups: {
            defaultVendors: {
              test: /[\\/]node_modules[\\/]/,
              idHint: 'vendors',
              chunks: 'async',
              reuseExistingChunk: true,
            },
          },
        },
        minimizer: config.prod
          ? [
              new TerserPlugin({
                test: /\.m?js(\?.*)?$/i,
                terserOptions: {
                  safari10: true,
                },
              }),
            ]
          : [],
      },
      plugins: [new WebpackBar(), new CopyPlugin(config.copy)],
    };

    const legacyConfig = merge(webpackConfig, {
      entry: {
        'js/patternlab-pattern': path.join(
          __dirname,
          './src/scripts/patternlab-pattern.js'
        ),
        'js/patternlab-viewer': path.join(
          __dirname,
          './src/scripts/patternlab-viewer.js'
        ),
        'css/pattern-lab': path.join(__dirname, './src/sass/pattern-lab.scss'),
      },
      module: {
        rules: [
          {
            test: /\.js$/,
            exclude: /(bower_components|document-register-element)/,
            use: {
              loader: 'babel-loader',
              options: getBabelConfig(false),
            },
          },
        ],
      },
      plugins: [
        new MiniCssExtractPlugin({
          filename: `[name].css`,
          chunkFilename: `[id].css`,
        }),
      ],
    });

    const modernConfig = merge(webpackConfig, {
      resolve: {
        mainFields: ['esnext', 'jsnext:main', 'browser', 'module', 'main'],
      },
      entry: {
        'js/patternlab-pattern': path.join(
          __dirname,
          './src/scripts/patternlab-pattern.modern.js'
        ),
        'js/patternlab-viewer': path.join(
          __dirname,
          './src/scripts/patternlab-viewer.modern.js'
        ),
        'css/pattern-lab': path.join(__dirname, './src/sass/pattern-lab.scss'),
      },
      output: {
        path: path.resolve(process.cwd(), `${config.buildDir}/styleguide`),
        publicPath: `${config.publicPath}`,
        filename: '[name].modern.js',
        chunkFilename: `js/[name]-chunk-[chunkhash].modern.js`,
      },
      module: {
        rules: [
          {
            test: /\.js$/,
            exclude: /(node_modules)/,
            use: {
              loader: 'babel-loader',
              options: getBabelConfig(true),
            },
          },
        ],
      },
      plugins: [
        // clear out the buildDir on every fresh Webpack build
        new CleanWebpackPlugin({
          verbose: false,
          cleanOnceBeforeBuildPatterns: config.watch
            ? []
            : [
                `${config.buildDir}/index.html`,
                `${config.buildDir}/styleguide/css`,
                `${config.buildDir}/styleguide/js`,
              ],

          // perform clean just before files are emitted to the output dir
          beforeEmit: false,
        }),
        new HtmlWebpackPlugin({
          filename: '../index.html',
          template: path.resolve(__dirname, 'src/html/index.html'),
          inject: false,
        }),
        new MiniCssExtractPlugin({
          filename: `[name].css`,
          chunkFilename: `[id].css`,
        }),
      ],
    });

    return resolve([modernConfig, legacyConfig]);
  });
};
