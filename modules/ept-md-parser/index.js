var path = require('path');
var parser = require(path.normalize(__dirname + '/backend'));

module.exports =  {
  name: 'md-parser',
  parser: parser
};
