var path = require('path');
var routes = require(path.normalize(__dirname + '/routes'));

module.exports =  {
  name: 'breadcrumbs',
  routes: routes
};
