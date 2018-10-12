const path = require('path');
const webpack = require('webpack');
const Promise = require('bluebird');

const appPath = path.join(__dirname, '..', '..', 'app');
const nodeModulesPath = path.join(__dirname, '..', '..', 'node_modules');

const config = {
  entry: appPath + '/app.js',
  output: {
    path: path.join(__dirname, '/../../public/js'),
    publicPath: '/static/js/',
    filename: 'bundle.js',
    chunkFilename: '[id].bundle.js',
    sourceMapFilename: 'bundle.map'
  },
  resolve: {
    modules: [
      nodeModulesPath
    ],
    alias: {
      jquery: 'jquery/dist/jquery',
      angular: 'angular/angular',
      ngAnimate: 'angular-animate/angular-animate',
      ngResource: 'angular-resource/angular-resource',
      ngSanitize: 'angular-sanitize/angular-sanitize',
      uiRouter: '@uirouter/angularjs/release/angular-ui-router',
      ngLoadingBar: 'angular-loading-bar',
      nestable: 'nestable/jquery.nestable',
      angularSortable: 'angular-sortable-view/src/angular-sortable-view.min',
      ngTagsInput: 'ng-tags-input/build/ng-tags-input.min'
    }
  },
  plugins: [],
  module: {
    noParse: [
      nodeModulesPath + '/jquery/dist/jquery',
      nodeModulesPath + '/angular/angular',
      nodeModulesPath + '/angular-animate/angular-animate',
      nodeModulesPath + '/angular-resource/angular-resource',
      nodeModulesPath + '/angular-sanitize/angular-sanitize',
      nodeModulesPath + '/angular-ui-router/release/angular-ui-router',
      nodeModulesPath + '/angular-loading-bar',
      nodeModulesPath + '/nestable/jquery.nestable',
      nodeModulesPath + '/angular-sortable-view/src/angular-sortable-view.min',
      nodeModulesPath + '/ng-tags-input/build/ng-tags-input.min',
    ],
    rules: [
      {
        test: /\.html$/,
        loader: 'html-loader'
      }
    ]
  },
  stats: 'errors-only'
};

module.exports = function() {
  var opts = { watch: true, prod: false };
  if (process.env.NODE_ENV === 'production') {
    opts = { watch: false, prod: true };
  }

  // webpack watching
  config.watch = config.cache = opts.watch;

  // webpack minification
  if (opts.prod) {
    var minify = new webpack.optimize.UglifyJsPlugin({
      mangle: true,
      compress: { warnings: false },
    });
    config.plugins.push(minify);
  }

  const webpackCallback = function(err, data) {
    if (err) return Promise.reject(err);
    console.log('Webpack Complete.');
    if (process.env.NODE_ENV === 'development') {
      console.log(data.toString({colors: true}));
    }
    return Promise.resolve();
  }

  return webpack(config, webpackCallback);
};
