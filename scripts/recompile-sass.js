var path = require('path');
var sass = require(path.join(__dirname, 'tasks', 'sass'));
var copycss = require(path.join(__dirname, 'tasks', 'copy_files'));
var installModules = require(path.join(__dirname, 'tasks', 'load_modules'));

installModules().then(copycss).then(sass);
