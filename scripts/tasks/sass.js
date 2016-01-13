var fs = require('fs');
var sass = require('node-sass');
var Promise = require('bluebird');

// file params
var sassPath = './app/scss/app.scss';
var publicSassPath = './public/css/app.css';

module.exports = function(publicPath) {
  var currentSassPath = publicPath || publicSassPath;
  return new Promise(function(resolve, reject) {
    var opts = { file: sassPath };
    var output = sass.renderSync(opts);
    fs.writeFile(currentSassPath, output.css, function(err) {
      if (err) { reject(err); }
      else {
        console.log('SASS Compilation Complete.');
        return resolve();
      }
    });
  });
};
