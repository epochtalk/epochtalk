var path = require('path');
var webpack = require('webpack');
var Promise = require('bluebird');

var appPath = path.join(__dirname, '/../../app');
var nodeModulesPath = path.join(__dirname, '/../../node_modules');

var webpackConfigs = {
  entry: appPath + '/app.js',
  output: {
    path: path.join(__dirname, '/../../public/js'),
    publicPath: '/static/js/',
    filename: 'bundle.js',
    chunkFilename: '[id].bundle.js',
    sourceMapFilename: 'bundle.map'
  },
  resolve: {
    root: [nodeModulesPath],
    alias: {
      jquery: 'jquery/dist/jquery',
      angular: 'angular/angular',
      ngAnimate: 'angular-animate/angular-animate',
      ngResource: 'angular-resource/angular-resource',
      ngSanitize: 'angular-sanitize/angular-sanitize',
      uiRouter: 'angular-ui-router/release/angular-ui-router',
      ngLoadingBar: 'angular-loading-bar',
      nestable: 'nestable/jquery.nestable',
      angularSortable: 'angular-sortable-view/src/angular-sortable-view.min',
      ngTagsInput: 'ng-tags-input/build/ng-tags-input.min'
    }
  },
  plugins: [ new webpack.optimize.DedupePlugin() ],
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
    loaders: [ { test: /\.html$/, loader: 'html-loader' } ]
  }
};

module.exports = function() {
  var opts = { watch: true, prod: false };
  if (process.env.NODE_ENV === 'production') {
    opts = { watch: false, prod: true };
  }

  // webpack watching
  webpackConfigs.watch = webpackConfigs.cache = opts.watch;

  // webpack minification
  if (opts.prod) {
    var minify = new webpack.optimize.UglifyJsPlugin({
      mangle: true,
      compress: { warnings: false },
    });
    webpackConfigs.plugins.push(minify);
  }

  // running webpack
  return new Promise(function(resolve, reject) {
    var webpackCallback = function(err, data) {
      if (err) { return reject(err); }
      else {
        console.log('Webpack Complete.');
        return resolve();
      }
    };

    return webpack(webpackConfigs, webpackCallback);
  });
};
