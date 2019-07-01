var path = require('path');
var watch = require('watch');
var nodemon = require('nodemon');
var Promise = require('bluebird');
var installModules = require(path.normalize(__dirname + '/load_modules'));
var sass = require(path.join(__dirname, 'sass'));
var symlink = require(path.join(__dirname, 'symlink'));
var copy_css = require(path.join(__dirname, 'copy_files'));

var monitors = [];
var localModulesPath = path.normalize(__dirname + '/../../modules');
var rootDirectoryPath = path.normalize(__dirname + '/../..');

var coreDir = 'core';

var backendDirs = require(path.normalize(localModulesPath + '/include'));

var frontendDir = 'ept-frontend';

module.exports = function() {
  // deploy nodemon first
  var nm = launchNodemon();

  // watch core-pg dir
  monitorBEDir(coreDir, rootDirectoryPath, nm)
  .then(function(monitor) { monitors.push(monitor); });

  // watch backend dirs
  backendDirs.map(function(module) {
    return monitorBEDir(module, localModulesPath, nm)
    .then(function(monitor) { monitors.push(monitor); });
  });

  // watch frontend dir
  monitorFEDir(frontendDir)
  .then(function(monitor) { monitors.push(monitor); });

  // exiting
  process.once('SIGINT', function() {
    monitors.map(function(monitor) { monitor.stop(); });
    process.exit(0);
  });
};

var launchNodemon = function() {
  var nmOpts = {
    script: './server/index.js',
    watch: [ './server', './public' ],
    ignore: [
      './app/*',
      './cli/*',
      './content/*',
      './public/js/*',
      './public/css/*',
      './public/fonts/*',
      './public/images/*',
      './public/templates',
      './repl/*',
      './scripts/*',
      './tests/*',
    ],
    ext: 'js html'
  };
  return nodemon(nmOpts);
};

// watching the watcher
var monitorBEDir = function(module, path, nm) {
  return new Promise(function(resolve) {
    var dirPath = path + '/' + module;
    watch.createMonitor(dirPath, function(monitor) {
      monitor.on('created', function() { nm.emit('restart'); });
      monitor.on('changed', function() { nm.emit('restart'); });
      monitor.on('removed', function() { nm.emit('restart'); });
      return resolve(monitor);
    });
  });
};

var monitorFEDir = function(dir) {
  return new Promise(function(resolve) {
    var dirPath = localModulesPath + '/' + dir;
    watch.createMonitor(dirPath, function(monitor) {
      monitor.on('created', function() {
        installModules()
        .then(copy_css)
        .then(sass);
      });
      monitor.on('changed', function() {
        installModules()
        .then(copy_css)
        .then(sass);
      });
      monitor.on('removed', function() {
        installModules()
        .then(copy_css)
        .then(sass);
      });
      return resolve(monitor);
    });
  });
};
