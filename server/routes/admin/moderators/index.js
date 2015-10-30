var path = require('path');
var moderators = require(path.normalize(__dirname + '/config'));

module.exports = [
  { method: 'POST', path: '/moderators', config: moderators.add },
  { method: 'POST', path: '/moderators/remove', config: moderators.remove },
];
