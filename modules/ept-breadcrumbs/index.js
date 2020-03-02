var path = require('path');
var routes = require(path.normalize(__dirname + '/routes'));
var db = require(path.normalize(__dirname + '/db'));

module.exports =  {
  name: 'breadcrumbs',
  routes: routes,
  db: db
};
