var path = require('path');
var db = require(path.normalize(__dirname + '/db'));
// var plugins = require(path.normalize(__dirname + '/plugins'));

module.exports =  {
  name: 'images',
  db: db,
  // plugins: plugins
};
