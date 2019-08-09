var path = require('path');

module.exports = [
  {
    name: 'auth.userTrust.addTrustBoard',
    method: require(path.normalize(__dirname + '/addTrustBoard'))
  },
  {
    name: 'auth.userTrust.addTrustFeedback',
    method: require(path.normalize(__dirname + '/addTrustFeedback'))
  },
  {
    name: 'auth.userTrust.deleteTrustBoard',
    method: require(path.normalize(__dirname + '/deleteTrustBoard'))
  },
  {
    name: 'auth.userTrust.editDefaultTrustList',
    method: require(path.normalize(__dirname + '/editDefaultTrustList'))
  },
  {
    name: 'auth.userTrust.getDefaultTrustList',
    method: require(path.normalize(__dirname + '/getDefaultTrustList'))
  }
];
