var fse = require('fs-extra');
var Promise = require('bluebird');

module.exports = function() {
  var loadingBarCss = function() {
    return new Promise(function(resolve, reject) {
      var filepath = './node_modules/angular-loading-bar/build/loading-bar.css';
      var dest = './app/scss/loading-bar.scss';
      fse.copy(filepath, dest, function(err) {
        if (err) { return reject(err); }
        console.log('Loading Bar CSS Copied.');
        return resolve();
      });
    });
  };

  var customVariablesCss = function() {
    return new Promise(function(resolve, reject) {
      var filepath = './app/scss/ept/variables/_default-variables.scss';
      var dest = './content/sass/_custom-variables.scss';
      if (fse.existsSync(dest)) { return resolve(); }
      else {
        fse.copy(filepath, dest, function(err) {
          if (err) { return reject(err); }
          console.log('Custom Variables CSS Copied.');
          return resolve();
        });
      }
    });
  };

  var previewVariablesCss = function() {
    return new Promise(function(resolve, reject) {
      var filepath = './app/scss/ept/variables/_preview-variables.scss';
      if (fse.existsSync(filepath)) { return resolve(); }
      else {
        fse.writeFile(filepath, '', function(err) {
          if (err) { return reject(err); }
          console.log('Preview Variables CSS Copied.');
          return resolve();
        });
      }
    });
  };

  return loadingBarCss()
  .then(customVariablesCss)
  .then(previewVariablesCss)
  .catch(function(err) { console.log(err); });
};
