var path = require('path');
var webpack = require('webpack');
var Promise = require('bluebird');

var appPath = path.join(__dirname, '/../../app');
var bowerComponentsPath = path.join(__dirname, '/../../bower_components');

var webpackConfigs = {
  entry: appPath + '/app.js',
  output: {
    path: path.join(__dirname, '/../../public/js'),
    publicPath: '/static/js/',
    filename: 'bundle.js',
    chunkFilename: '[id].bundle.js',
    sourceMapFilename: "bundle.map"
  },
  resolve: {
    root: [bowerComponentsPath],
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
      ngTagsInput: 'ng-tags-input/ng-tags-input.min'
    }
  },
  plugins: [ new webpack.optimize.DedupePlugin() ],
  module: {
    noParse: [
      bowerComponentsPath + '/jquery/dist/jquery',
      bowerComponentsPath + '/angular/angular',
      bowerComponentsPath + '/angular-animate/angular-animate',
      bowerComponentsPath + '/angular-resource/angular-resource',
      bowerComponentsPath + '/angular-sanitize/angular-sanitize',
      bowerComponentsPath + '/angular-ui-router/release/angular-ui-router',
      bowerComponentsPath + '/angular-loading-bar',
      bowerComponentsPath + '/nestable/jquery.nestable',
      bowerComponentsPath + '/angular-sortable-view/src/angular-sortable-view.min',
      bowerComponentsPath + '/ng-tags-input/ng-tags-input.min',
    ],
    loaders: [ { test: /\.html$/, loader: 'html-loader' } ]
  }
};

module.exports = function(opts) {
  // webpack watching
  opts = opts || {};
  if (opts.watch === undefined) { opts.watch = true; }
  webpackConfigs.watch = webpackConfigs.cache = opts.watch;

  // webpack minification
  opts.prod = opts.prod || false;
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
