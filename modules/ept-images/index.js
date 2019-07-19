var path = require('path');
var db = require(path.normalize(__dirname + '/db'));
var routes = require(path.normalize(__dirname + '/routes'));
var plugins = require(path.normalize(__dirname + '/plugins'));
var common = require(path.normalize(__dirname + '/common'));

module.exports =  {
  name: 'images',
  db: db,
  routes: routes,
  routeOpts: { config: true },
  plugins: plugins,
  common: common.export()
};
