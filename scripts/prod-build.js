var path = require('path');
var sass = require(path.join(__dirname, 'tasks', 'sass'));
var clean = require(path.join(__dirname, 'tasks', 'clean'));
var pack = require(path.join(__dirname, 'tasks', 'webpack'));
var symlink = require(path.join(__dirname, 'tasks', 'symlink'));
var copy_css = require(path.join(__dirname, 'tasks', 'copy_files'));

clean()
.then(copy_css)
.then(sass)
.then(symlink)
.then(function() {
  var opts = { watch: false, prod: true };
  return pack(opts);
});
