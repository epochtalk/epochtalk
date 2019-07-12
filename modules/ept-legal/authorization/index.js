var path = require('path');

module.exports = [
  {
    name: 'auth.legal.reset',
    method: require(path.normalize(__dirname + '/reset'))
  },
  {
    name: 'auth.legal.text',
    method: require(path.normalize(__dirname + '/text'))
  },
  {
    name: 'auth.legal.update',
    method: require(path.normalize(__dirname + '/update'))
  }
];
