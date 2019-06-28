var path = require('path');
var routes = require(path.normalize(__dirname + '/routes'));
var permissions = require(path.normalize(__dirname + '/permissions'));
var authorization = require(path.normalize(__dirname + '/authorization'));

module.exports =  {
  name: 'legal',
  routes: routes,
  permissions: permissions,
  authorization: authorization
};
