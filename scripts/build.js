var path = require('path');
var Promise = require('bluebird');
var clean = require(path.join(__dirname, 'tasks', 'clean'));
var sass = require(path.join(__dirname, 'tasks', 'sass'));
var browserify = require(path.join(__dirname, 'tasks', 'browserify'));
var copy_css = require(path.join(__dirname, 'tasks', 'copy_files'));

clean()
.then(copy_css)
.then(sass)
.then(function() {
  return new Promise(function(resolve, reject) {
    browserify(false, function(err) {
      if (err) { reject(err); }
      else { resolve(); }
    });
  });
});
