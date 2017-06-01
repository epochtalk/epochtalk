var path = require('path');
var hooks = require(path.normalize(__dirname + '/hooks'));
var routes = require(path.normalize(__dirname + '/routes'));
var db = require(path.normalize(__dirname + '/db'));
var common = require(path.normalize(__dirname + '/common'));
var permissions = require(path.normalize(__dirname + '/permissions'));

module.exports =  {
  name: 'patroller',
  permissions: permissions,
  db: db,
  common: common,
  routes: routes,
  hooks: hooks
};
