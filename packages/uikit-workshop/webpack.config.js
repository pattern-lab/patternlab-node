// webpack.config.js
const CleanWebpackPlugin = require('clean-webpack-plugin');
const UglifyJsPlugin = require('uglifyjs-webpack-plugin');
const NoEmitPlugin = require('no-emit-webpack-plugin');
const autoprefixer = require('autoprefixer');
const CriticalCssPlugin = require('critical-css-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const selectorImporter = require('node-sass-selector-importer');
const path = require('path');

const cosmiconfig = require('cosmiconfig');
const explorer = cosmiconfig('patternlab');

// @todo: wire these two ocnfigs up to use cosmicconfig!
const defaultConfig = {
  buildDir: './dist',
  prod: true, // or false for local dev
  sourceMaps: true,
  publicPath: './styleguide/',
};

module.exports = async function() {
  return new Promise(async (resolve, reject) => {
    let customConfig = defaultConfig;

    const configToSearchFor = await explorer.searchSync();
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
          plugins: () => [
            autoprefixer({
              browsers: [
                'last 2 version',
                'safari 5',
                'ie 8',
                'ie 9',
                'opera 12.1',
                'android 4',
              ],
            }),
          ],
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
      resolve: {
        extensions: ['.js', '.jsx'],
        alias: {
          react: 'preact-compat',
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
                  ['@babel/plugin-proposal-decorators', { legacy: true }],
                  '@babel/plugin-proposal-class-properties',
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
            test: /\.scss$/,
            oneOf: [
              {
                resourceQuery: /external/, // foo.scss?external
                use: [
                  {
                    loader: 'style-loader',
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
                sourceMap: true,
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
        // clear out the buildDir on every fresh Webpack build
        new CleanWebpackPlugin(
          [
            `${config.buildDir}/index.html`,
            `${config.buildDir}/styleguide/css`,
            `${config.buildDir}/styleguide/js`,
          ],
          {
            allowExternal: true,

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

    if (config.prod) {
      webpackConfig.plugins.push(
        new CriticalCssPlugin({
          base: path.resolve(__dirname, config.buildDir),
          src: 'index.html',
          dest: 'index.html',
          inline: true,
          minify: true,
          extract: true,
          width: 1300,
          height: 900,
          penthouse: {
            keepLargerMediaQueries: true,

            // @todo: troubleshoot why forceInclude works w/ Penthouse directly but not w/ Critical
            forceInclude: [
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
