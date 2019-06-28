var path = require('path');
var db = require(path.normalize(__dirname + '/db'));

module.exports =  {
  name: 'polls',
  db: db
};
