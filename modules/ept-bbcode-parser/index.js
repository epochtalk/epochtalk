var path = require('path');
var parser = require(path.normalize(__dirname + '/backend'));

module.exports =  {
  name: 'bbcode-parser',
  parser: parser
};
