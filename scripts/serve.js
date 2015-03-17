var fs = require('fs');
var path = require('path');
var nodemon = require('nodemon');
var Promise = require('bluebird');
var sass = require(path.join(__dirname, 'tasks', 'sass'));
var clean = require(path.join(__dirname, 'tasks', 'clean'));
var copy_css = require(path.join(__dirname, 'tasks', 'copy_files'));
var browserify = require(path.join(__dirname, 'tasks', 'browserify'));
var livereload = require(path.join(__dirname, 'tasks', 'livereload'));

clean()
.then(copy_css)
.then(sass)
.then(function() {
  return new Promise(function(resolve, reject) {
    browserify(true, function(err) {
      if (err) { reject(err); }
      else { resolve(); }
    });
  });
})
.then(livereload)
.then(function() { // nodemon
  var nmOpts = {
    script: './server/index.js',
    ignore: [
      './app',
      './cli',
      './public',
      './repl',
      './scripts',
      './tests',
    ]
  };
  nodemon(nmOpts);
});
