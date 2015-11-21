var plugins = {};
module.exports = plugins;

var _ = require('lodash');
var path = require('path');
var exec = require('child_process').exec;
var db = require(path.normalize(__dirname + '/../db'));
var pluginsPath = path.normalize(__dirname);
var endpointCache = {
  "before-post": [],
  "after-post": []
};

// Runs on server startup and binds all the plugins to the server instance
plugins.bootstrap = function() {
  var pluginRoutes = [];

  // get a list of all plugins registered with the server
  return db.plugins.all()
  .each(function(dbPlugin) {
    // check if plugin exists in node_modules folder
    var plugin = loadPlugin(dbPlugin.name);
    if (!plugin) { return; }
    else { plugin.name = dbPlugin.name; }

    // attach db methods
    if (plugin.db) { db[plugin.name] = plugin.db; }

    // attach plugin endpoints to endpointCache
    if (plugin.endpoints) { updateEndpointCache(plugin); }

    // load routes
    if (plugin.routes) { pluginRoutes = pluginRoutes.concat(plugin.routes); }
  })
  .then(function() { return pluginRoutes; });
};

// Remote call into all plugin methods that's bound to the given endpoint
plugins.fire = function(endpointKey, value) {
  var hooks = endpointCache[endpointKey];
  hooks.forEach(function(hook) { value = hook(value); });
  return value;
};

// check db for plugin registration
plugins.checkInstallation = function(pluginName) {
  return db.plugins.exists(pluginName);
};

// validate plugin installation
  // TODO: check that template partials are installed
  // TODO: check that directive is installed

plugins.install = function(pluginName) {
  return new Promise(function(resolve, reject) {
    fs.stat(path.join(pluginsPath, pluginName), function(err, stats) {
      if (err) {
        return reject(err);
      }
      else if (stats.isDirectory() || stats.isFile()) {
        return resolve();
      }
      else {
        return reject();
      }
    });
  })
  .then(function() {
    var filePath = path.join(pluginsPath, pluginName, 'migrations', 'up.sql');
    console.log(filePath);
    var migration = fs.readFile(filePath, 'utf8', function(err, data) {
      // TODO: still insecure
      if (err) { return; }
      if (!err) { return db.plugins.migrateUp(data); }
    });
  })
  // add plugin to database
  .then(function() {
    return db.plugins.add(pluginName);
  });
};

plugins.update = function(pluginName) {
  // TODO: migrations?
  return new Promise(function(resolve, reject) {
    // TODO: security risk - clean pluginName
    var child = exec('npm update ' + pluginName, function(err) {
      if (err) { return reject(err); }
      else { return resolve(); }
    });
  });
};

plugins.uninstall = function(pluginName) {
  // remove from the db
  return db.plugins.remove(pluginName)
  // run migration down script
  .then(function() {
    return new Promise(function(resolve, reject) {
      var filePath = nodeModulesPath + pluginName + '/migrations/down.sql';
      var migration = fs.readFile(filePath, 'utf8', function(err, data) {
        // TODO: still insecure
        if (err) { return resolve(); }
        if (!err) { return db.plugins.migrateUp(data).then(resolve); }
      });
    });
  })
  // uninstall plugin by pluginName using npm
  .then(function() {
    return new Promise(function(resolve, reject) {
      // TODO: security risk - clean pluginName
      var child = exec('npm uninstall ' + pluginName, function(err) {
        if (err) { return reject(err); }
        else { return resolve(); }
      });
    });
  });
};

function loadPlugin(pluginName) {
  try { return require(pluginName)(db); }
  catch(ex) { console.log('Cannot load Plugin -- ' + pluginName + ': ', ex); return; }
}

function updateEndpointCache(plugin) {
  if (!plugin.endpoints) { return; }

  var endpoints = plugin.endpoints;
  var keys = _.keys(endpointCache);

  keys.forEach(function(key) {
    if (endpoints[key]) { endpointCache[key].push(endpoints[key]); }
  });
}
