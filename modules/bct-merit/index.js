var path = require('path');
var db = require(path.normalize(__dirname + '/db'));
// var routes = require(path.normalize(__dirname + '/routes'));
// var permissions = require(path.normalize(__dirname + '/permissions'));
// var authorization = require(path.normalize(__dirname + '/authorization'));
// var hooks = require(path.normalize(__dirname + '/hooks'));

module.exports =  {
  name: 'merit',
  db: db,
  // authorization: authorization
  // routes: routes,
  // permissions: permissions,
  // hooks: hooks
};
