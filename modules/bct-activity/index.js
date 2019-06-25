var path = require('path');
var db = require(path.normalize(__dirname + '/db'));
var hooks = require(path.normalize(__dirname + '/hooks'));

module.exports =  {
  name: 'userActivity',
  hooks: hooks,
  db: db
};
