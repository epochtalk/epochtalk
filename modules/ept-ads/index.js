var path = require('path');
var routes = require(path.normalize(__dirname + '/routes'));
var permissions = require(path.normalize(__dirname + '/permissions'));

module.exports =  {
  name: 'ads',
  permissions: permissions,
  routes: routes
};
