var path = require('path');

module.exports = [
  {
    name: 'auth.legal.reset',
    method: require(path.normalize(__dirname + '/reset')),
    options: { callback: false }
  },
  {
    name: 'auth.legal.text',
    method: require(path.normalize(__dirname + '/text')),
    options: { callback: false }
  },
  {
    name: 'auth.legal.update',
    method: require(path.normalize(__dirname + '/update')),
    options: { callback: false }
  }
];
