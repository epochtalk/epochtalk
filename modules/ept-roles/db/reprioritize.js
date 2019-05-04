var path = require('path');
var dbc = require(path.normalize(__dirname + '/db'));
var db = dbc.db;
var helper = dbc.helper;
var Promise = require('bluebird');
var using = Promise.using;

module.exports = function(orderedRoles) {
  orderedRoles = helper.deslugify(orderedRoles);
  var q, params;
  return using(db.createTransaction(), function(client) {
    q = 'UPDATE roles SET priority = $1 WHERE id = $2';
    return Promise.map(orderedRoles, function(role) {
      params = [role.priority, role.id];
      return client.query(q, params);
    });
  })
  .then(function() { return {}; });
};
