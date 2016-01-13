require('dotenv').load();
var path = require('path');
var nodemon = require('nodemon');
var sass = require(path.join(__dirname, 'tasks', 'sass'));
var clean = require(path.join(__dirname, 'tasks', 'clean'));
var pack = require(path.join(__dirname, 'tasks', 'webpack'));
var symlink = require(path.join(__dirname, 'tasks', 'symlink'));
var copy_css = require(path.join(__dirname, 'tasks', 'copy_files'));
var livereload = require(path.join(__dirname, 'tasks', 'livereload'));
var plugins = require(path.join(__dirname, 'tasks', 'plugins'));

clean()
.then(copy_css)
.then(sass)
.then(plugins)
.then(symlink)
.then(pack)
.then(livereload)
.then(function() { // nodemon
  if (process.env.NODE_ENV === 'production') {
    require(path.join(__dirname, '..', 'server', 'index'));
  }
  else {
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
  }
})
.catch(function(err) {
  console.log(err);
  process.exit(1);
});
