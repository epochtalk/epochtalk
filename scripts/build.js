var path = require('path');
var sass = require(path.join(__dirname, 'tasks', 'sass'));
var clean = require(path.join(__dirname, 'tasks', 'clean'));
var pack = require(path.join(__dirname, 'tasks', 'webpack'));
var symlink = require(path.join(__dirname, 'tasks', 'symlink'));
var copy_css = require(path.join(__dirname, 'tasks', 'copy_files'));
var installModules = require(path.join(__dirname, 'tasks', 'load_modules'));

clean()
.then(installModules)
.then(copy_css)
.then(sass)
.then(symlink)
.then(pack);
