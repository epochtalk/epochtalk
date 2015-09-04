var path = require('path');
var sass = require(path.join(__dirname, 'tasks', 'sass'));
var copy_css = require(path.join(__dirname, 'tasks', 'copy_files'));

copy_css().then(sass);
