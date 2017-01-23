var path = require('path');

module.exports = [
  require(path.normalize(__dirname + '/ads/create')),
  require(path.normalize(__dirname + '/ads/duplicate')),
  require(path.normalize(__dirname + '/ads/edit')),
  require(path.normalize(__dirname + '/ads/remove')),
  require(path.normalize(__dirname + '/ads/view')),
  require(path.normalize(__dirname + '/analytics/view')),
  require(path.normalize(__dirname + '/factoids/create')),
  require(path.normalize(__dirname + '/factoids/edit')),
  require(path.normalize(__dirname + '/factoids/remove')),
  require(path.normalize(__dirname + '/factoids/enable')),
  require(path.normalize(__dirname + '/factoids/disable')),
  require(path.normalize(__dirname + '/rounds/create')),
  require(path.normalize(__dirname + '/rounds/info')),
  require(path.normalize(__dirname + '/rounds/rotate')),
  require(path.normalize(__dirname + '/rounds/view')),
  require(path.normalize(__dirname + '/text/save'))
];
