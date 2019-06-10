var path = require('path');
var _ = require('lodash');
var changeCase = require('change-case');
var renameKeys = require('deep-rename-keys');
var dbc = require(path.normalize(__dirname + '/db'));
var db = dbc.db;
var errors = dbc.errors;
var NotFoundError = errors.NotFoundError;

// returns object of private configurations
module.exports = function() {
  var q = 'SELECT config FROM configurations WHERE name = \'default\'';
  return db.sqlQuery(q)
  .then(function(queryResults) {
    if (queryResults.length > 0) {
      var privateConfigurations = queryResults[0].config;

      if (_.isObject(privateConfigurations)) {
        privateConfigurations = renameKeys(privateConfigurations, function(key) {
          return changeCase.camel(key);
        });
      }

      return privateConfigurations;
    }
    else { throw new NotFoundError('Configurations Not Found'); }
  });
};
