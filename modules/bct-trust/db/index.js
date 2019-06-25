var path = require('path');

module.exports = {
  addTrustFeedback: require(path.normalize(__dirname + '/addTrustFeedback')),
  trustSources: require(path.normalize(__dirname + '/trustSources')),
  getTrustDepth: require(path.normalize(__dirname + '/getTrustDepth')),
  getTrustHierarchy: require(path.normalize(__dirname + '/getTrustHierarchy')),
  editTrustList: require(path.normalize(__dirname + '/editTrustList')),
  getTrustList: require(path.normalize(__dirname + '/getTrustList')),
  getTrustStats: require(path.normalize(__dirname + '/getTrustStats')),
  getTrustFeedback: require(path.normalize(__dirname + '/getTrustFeedback')),
  getTrustBoards: require(path.normalize(__dirname + '/getTrustBoards')),
  addTrustBoard: require(path.normalize(__dirname + '/addTrustBoard')),
  deleteTrustBoard: require(path.normalize(__dirname + '/deleteTrustBoard'))
};
