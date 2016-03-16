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

  // Module Routes
  if (module.routes && module.routes.length > 0) {
    master.routes = master.routes.concat(module.routes);
  }

  // Module Common methods
  if (module.common && module.common.length > 0) {
    master.common = master.common.concat(module.common);
  }

  // Module Authorization methods
  if (module.authorization && module.authorization.length > 0) {
    master.authorization = master.authorization.concat(module.authorization);
  }

  // Module API Methods
  if (module.api) { master.apiMethods[name] = module.api; }

  // Module DB Methods
  if (module.db) { master.db[name] = module.db; }

  // Module Permssion Defaults
  if (module.permissions && module.permissions.defaults) {
    master.permissions.defaults[name] = module.permissions.defaults;
  }

  // Module Permission validation methods
  if (module.permissions && module.permissions.validation) {
    master.permissions.validations[name] = module.permissions.validation;
  }

  // Module Permission layouts
  if (module.permissions && module.permissions.layout) {
    master.permissions.layouts[name] = module.permissions.layout;
  }
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
