var path = require('path');
var db = require(path.normalize(__dirname + '/db'));
var routes = require(path.normalize(__dirname + '/routes'));
var common = require(path.normalize(__dirname + '/common'));
var permissions = require(path.normalize(__dirname + '/permissions'));
var authorization = require(path.normalize(__dirname + '/authorization'));

module.exports =  {
  name: 'posts',
  permissions: permissions,
  // routes: routes,
  common: common.export(),
  authorization: authorization,
  db: db,
  api: common.apiExport()
};
