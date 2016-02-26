var path = require('path');
var modulesDir = path.normalize(__dirname + '/../../../modules');
var modulesNMDir = path.normalize(__dirname + '/../../../modules/node_modules');
var modules = {};

modules.install = (db) => {
  var master = {
    db: db,
    routes: [],
    common: [],
    authorization: [],
    apiMethods: {},
    permissions: {
      defaults: {},
      validations: {},
      layouts: {}
    },
  };

  // get a list of all modules in modules/package.json
  var packageJson = require(path.normalize(modulesDir + '/package.json'));
  var ept_modules = packageJson.dependencies;

  // extract code from modules
  for (var moduleName in ept_modules) {
    modules.load(moduleName, master);
  }

  // return collection of code from modules
  return master;
};


modules.load = (moduleName, master) => {
  // load the index.js for the given moduleName
  var module = require(path.normalize(modulesNMDir + '/' + moduleName));
  var name = module.name;

  // move all the parts to all the right places
  master.routes = master.routes.concat(module.routes);
  master.common = master.common.concat(module.common);
  master.authorization = master.authorization.concat(module.authorization);
  master.apiMethods[name] = module.api;
  master.db[name] = module.db;
  master.permissions.defaults[name] = module.permissions.defaults;
  master.permissions.validations[name] = module.permissions.validation;
  master.permissions.layouts[name] = module.permissions.layout;
};


exports.register = (server, options, next) => {
  options = options || {};
  var db = options.db || {};

  // load all the code from each module installed
  var output = modules.install(db);

  // decorate hapi with module apis
  server.decorate('server', 'modules', output.apiMethods);
  server.decorate('request', 'modules', output.apiMethods);

  return next(output);
};

exports.register.attributes = {
  name: 'modules',
  version: '1.0.0'
};
