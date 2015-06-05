var fse = require('fs-extra');
var Promise = require('bluebird');

module.exports = function() {
  var foundationComponents = new Promise(function(resolve, reject) {
    var filepath = './bower_components/foundation/scss/foundation/components';
    var dest = './app/scss/foundation/components';
    fse.copy(filepath, dest, function(err) {
      if (err) { return reject(err); }
      console.log('Foundation Components Copied.');
      return resolve();
    });
  });

  var foundationSass = new Promise(function(resolve, reject) {
    var filepath = './bower_components/foundation/scss/foundation.scss';
    var dest = './app/scss/foundation.scss';
    fse.copy(filepath, dest, function(err) {
      if (err) { return reject(err); }
      console.log('Foundation Sass Copied.');
      return resolve();
    });
  });

  var normalizeSass = new Promise(function(resolve, reject) {
    var filepath = './bower_components/foundation/scss/normalize.scss';
    var dest = './app/scss/normalize.scss';
    fse.copy(filepath, dest, function(err) {
      if (err) { return reject(err); }
      console.log('Normalize Sass Copied.');
      return resolve();
    });
  });

  var mediumCss = new Promise(function(resolve, reject) {
    var filepath = './node_modules/medium-editor/dist/css/medium-editor.css';
    var dest = './app/scss/medium-editor.scss';
    fse.copy(filepath, dest, function(err) {
      if (err) { return reject(err); }
      console.log('Medium Editor CSS Copied.');
      return resolve();
    });
  });

  var defaultCss = new Promise(function(resolve, reject) {
    var filepath = './node_modules/medium-editor/dist/css/themes/default.css';
    var dest = './app/scss/default.scss';
    fse.copy(filepath, dest, function(err) {
      if (err) { return reject(err); }
      console.log('Default CSS Copied.');
      return resolve();
    });
  });

  var loadingBarCss = new Promise(function(resolve, reject) {
    var filepath = './bower_components/angular-loading-bar/build/loading-bar.css';
    var dest = './app/scss/loading-bar.scss';
    fse.copy(filepath, dest, function(err) {
      if (err) { return reject(err); }
      console.log('Loading Bar CSS Copied.');
      return resolve();
    });
  });

  return Promise.join(foundationComponents, foundationSass, normalizeSass, mediumCss, defaultCss, function() {})
  .catch(function(err) { console.log(err); });
};
