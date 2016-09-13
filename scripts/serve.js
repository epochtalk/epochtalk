require('dotenv').load({silent: true});
var path = require('path');
var sass = require(path.join(__dirname, 'tasks', 'sass'));
var clean = require(path.join(__dirname, 'tasks', 'clean'));
var pack = require(path.join(__dirname, 'tasks', 'webpack'));
var symlink = require(path.join(__dirname, 'tasks', 'symlink'));
var copy_css = require(path.join(__dirname, 'tasks', 'copy_files'));
var watchFiles = require(path.join(__dirname, 'tasks', 'watching'));
var livereload = require(path.join(__dirname, 'tasks', 'livereload'));
var installModules = require(path.join(__dirname, 'tasks', 'load_modules'));


clean()
.then(installModules)
.then(copy_css)
.then(sass)
.then(symlink)
.then(pack)
.then(livereload)
.then(function() {
  if (process.env.NODE_ENV === 'production') {
    require(path.join(__dirname, '..', 'server', 'index'));
  }
  else { watchFiles(); }
});
