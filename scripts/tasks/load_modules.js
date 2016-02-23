var path = require('path');
var fse = require('fs-extra');
var Promise = require('bluebird');
var exec = require('child_process').exec;
var modulesDir = path.normalize(__dirname + '/../../modules');
var modulesNMDir = path.normalize(__dirname + '/../../modules/node_modules');
var appModulesDir = path.normalize(__dirname + '/../../app/modules');

module.exports = function() {
  return npmInstall()
  .then(loadModules);
};

// calls `npm install` on the /modules dir
function npmInstall() {
  return new Promise(function(resolve, reject) {
    var command = 'npm --prefix ./modules install';
    exec(command, (error) => {
      if (error) { return reject(error); }
      else { return resolve(); }
    });
  });
}

// 1.) loads the package.json from the /modules dir and retrieves all the deps as modules
// 2.) cleans out the /app/modules dir and ensure that dir exists
// 3.) calls load() on each module
function loadModules() {
  // get a list of all modules in modules/package.json
  var packageJson = require(path.normalize(modulesDir + '/package.json'));
  var ept_modules = packageJson.dependencies;

  // empty /app/modules dir, ensure /app/modules dir exists
  fse.emptyDirSync(appModulesDir);

  // extract client code from modules
  var modules = Object.keys(ept_modules);

  /// TESTING ONLY
  modules.push('ept-posts');

  return Promise.each(modules, function(key) { return load(key); });
}

// 1.) checks if each module has a client dir
// 2.) if it exists, symlink to /app/modules/{moduleName}
// 3.) symlink any HTML files if they exists
function load(moduleName) {
  // load the index.js for the given moduleName
  var inDir = path.normalize(modulesNMDir + '/' + moduleName + '/client');
  var outDir = path.normalize(appModulesDir + '/' + moduleName);

  // copy client files if they exists
  return checkDir(inDir)
  .then((exists) => {
    if (exists) { return linkDir(inDir, outDir); }
    else { return exists; }
  });
}

// check if client dir exists and is a directory
function checkDir(inDir) {
  return new Promise(function(resolve) {
    fse.stat(inDir, function(err, stats) {
      if (err || !stats.isDirectory()) { return resolve(false); }
      else { return resolve(true); }
    });
  });
}

// copies one dir to another dir
// symlinks do not get traversed in the symlink task
function linkDir(inDir, outDir) {
  return new Promise(function(resolve, reject) {
    fse.copy(inDir, outDir, function(err) {
      if (err) { return reject(err); }
      else { return resolve(); }
    });
  });
}
