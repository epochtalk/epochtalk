var path = require('path');
module.exports = [
  require(path.join(__dirname, 'get')),
  require(path.join(__dirname, 'save'))
];
