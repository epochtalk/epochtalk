var path = require('path');
var watch = require('watch');
var nodemon = require('nodemon');
var Promise = require('bluebird');
var installModules = require(path.normalize(__dirname + '/load_modules'));

var monitors = [];
var nmPath = path.normalize(__dirname + '/../../modules/node_modules');
var backendDirs = [
  'epochtalk-core-pg',
  'ept-categories',
  'ept-boards',
  'ept-messages',
  'ept-posts',
  'ept-threads',
  'ept-users',
  'ept-watchlist',
  'ept-reports',
  'ept-auth',
  'ept-ignore-users'
];
var frontendDir = 'ept-frontend';

module.exports = function() {
  // deploy nodemon first
  var nm = launchNodemon();

  // watch backend dirs
  backendDirs.map(function(dir) {
    return monitorBEDir(dir, nm)
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
    watch: [ './server', ],
    ignore: [
      './app',
      './cli',
      './content',
      './public',
      './repl',
      './scripts',
      './tests',
    ]
  };
  return nodemon(nmOpts);
};

// watching the watcher
var monitorBEDir = function(dir, nm) {
  return new Promise(function(resolve) {
    var dirPath = nmPath + '/' + dir;
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
    var dirPath = nmPath + '/' + dir;
    watch.createMonitor(dirPath, function(monitor) {
      monitor.on('created', function() { installModules(); });
      monitor.on('changed', function() { installModules(); });
      monitor.on('removed', function() { installModules(); });
      return resolve(monitor);
    });
  });
};
