var path = require('path');
var sass = require(path.join(__dirname, 'tasks', 'sass'));
var clean = require(path.join(__dirname, 'tasks', 'clean'));
var copy_css = require(path.join(__dirname, 'tasks', 'copy_files'));

clean()
.then(copy_css)
.then(sass);
