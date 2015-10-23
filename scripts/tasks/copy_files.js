var fse = require('fs-extra');
var Promise = require('bluebird');

module.exports = function() {
  var loadingBarCss = new Promise(function(resolve, reject) {
    var filepath = './bower_components/angular-loading-bar/build/loading-bar.css';
    var dest = './app/scss/loading-bar.scss';
    fse.copy(filepath, dest, function(err) {
      if (err) { return reject(err); }
      console.log('Loading Bar CSS Copied.');
      return resolve();
    });
  });

  return Promise.join(loadingBarCss, function() {})
  .catch(function(err) { console.log(err); });
};
