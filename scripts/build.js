var path = require('path');
var sass = require(path.join(__dirname, 'tasks', 'sass'));
var clean = require(path.join(__dirname, 'tasks', 'clean'));
var pack = require(path.join(__dirname, 'tasks', 'webpack'));
var symlink = require(path.join(__dirname, 'tasks', 'symlink'));
var plugins = require(path.join(__dirname, 'tasks', 'plugins'));
var copy_css = require(path.join(__dirname, 'tasks', 'copy_files'));

clean()
.then(copy_css)
.then(plugins)
.then(sass)
.then(symlink)
.then(pack);
