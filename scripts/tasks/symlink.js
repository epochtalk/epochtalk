var del = require('del');
var path = require('path');
var fse = require('fs-extra');
var Promise = require('bluebird');

var appDir = path.normalize(__dirname + '/../../app');
var templateDir = path.normalize(__dirname + '/../../public/templates');

module.exports = function() {
  var htmlFiles = [];

  // clear out the /public/templates dir
  return del(path.join(__dirname, '/../../public/templates'))
  // find any HTML files in /app dir
  .then(function() {
    return new Promise(function(resolve, reject) {
      fse.walk(appDir)
      .on('data', function(item) {
        var isFile = item.stats.isFile();
        var isSymbolicLink = item.stats.isSymbolicLink();
        if ((isFile || isSymbolicLink) && /.html$/.test(item.path)) {
          htmlFiles.push(item.path);
        }
        else { return; }
      })
      .on('error', function(err) { return reject(err); })
      .on('end', function() { return resolve(htmlFiles); });
    });
  })
  // symlink html files to /public/templates dir
  .then((htmlPaths) => {
    return Promise.each(htmlPaths, (htmlPath) => {
      var output = htmlPath;
      output = output.replace(appDir, templateDir);
      fse.ensureSymlink(htmlPath, output, function(err) {
        if (err) { throw err; }
        else { return; }
      });
    });
  });
};
