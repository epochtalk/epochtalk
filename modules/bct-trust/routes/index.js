var path = require('path');

module.exports = [
  require(path.normalize(__dirname + '/addTrustFeedback')),
  require(path.normalize(__dirname + '/getTrustStats')),
  require(path.normalize(__dirname + '/getTrustTree')),
  require(path.normalize(__dirname + '/getTrustList')),
  require(path.normalize(__dirname + '/getTrustFeedback')),
  require(path.normalize(__dirname + '/editTrustList')),
  require(path.normalize(__dirname + '/editDefaultTrustList')),
  require(path.normalize(__dirname + '/getDefaultTrustList')),
  require(path.normalize(__dirname + '/getTrustBoards')),
  require(path.normalize(__dirname + '/addTrustBoard')),
  require(path.normalize(__dirname + '/deleteTrustBoard'))
];
