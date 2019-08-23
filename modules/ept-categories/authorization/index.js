var path = require('path');

module.exports = [
  {
    name: 'auth.categories.create',
    method: require(path.normalize(__dirname + '/create'))
  },
  {
    name: 'auth.categories.delete',
    method: require(path.normalize(__dirname + '/delete'))
  }
];
