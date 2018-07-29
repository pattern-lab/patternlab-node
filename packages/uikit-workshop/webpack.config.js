// webpack.config.js
const UglifyJsPlugin = require('uglifyjs-webpack-plugin');

module.exports = {
  entry: {
    'patternlab-pattern': './src/scripts/patternlab-pattern',
    'patternlab-viewer': './src/scripts/patternlab-viewer',
  },
  output: {
    path: `${process.cwd()}/dist/styleguide/js`,
    filename: '[name].js',
    chunkFilename: `[name]-chunk-[chunkhash].js`,
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /(node_modules|bower_components)/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env'],
          },
        },
      },
    ],
  },
  cache: true,
  mode: 'production',
  optimization: {
    mergeDuplicateChunks: true,
    concatenateModules: true,
    minimizer: [
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
    ],
  },
  plugins: [],
};
