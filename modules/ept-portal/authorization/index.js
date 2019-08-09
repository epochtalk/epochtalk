var path = require('path');

module.exports = [
  {
    name: 'auth.portal.view',
    method: require(path.normalize(__dirname + '/view'))
  }
];
