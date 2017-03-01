var path = require('path');
var db = require(path.normalize(__dirname + '/db'));
var routes = require(path.normalize(__dirname + '/routes'));
var hooks = require(path.normalize(__dirname + '/hooks'));

module.exports =  {
  name: 'mentions',
  hooks: hooks,
  routes: routes,
  db: db
};
