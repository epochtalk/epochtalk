var fs = require('fs');
var path = require('path');
var sass = require('node-sass');
var Promise = require('bluebird');

// file params
var sassPath = './app/scss/app.scss';
var publicSassPath = './public/css/app.css';
var includeDirs = ['./app/scss/'];

module.exports = function() {
  return new Promise(function(resolve, reject) {
    var opts = { file: sassPath, includePaths: includeDirs };
    var output = sass.renderSync(opts);
    fs.writeFile(publicSassPath, output.css, function(err) {
      if (err) { reject(err); }
      else {
        console.log('SASS Compilation Complete.');
        return resolve();
      }
    });
  });
};
