var path = require('path');

module.exports = [
  {
    name: 'auth.userTrust.addTrustBoard',
    method: require(path.normalize(__dirname + '/addTrustBoard')),
    options: { callback: false }
  },
  {
    name: 'auth.userTrust.addTrustFeedback',
    method: require(path.normalize(__dirname + '/addTrustFeedback')),
    options: { callback: false }
  },
  {
    name: 'auth.userTrust.deleteTrustBoard',
    method: require(path.normalize(__dirname + '/deleteTrustBoard')),
    options: { callback: false }
  },
  {
    name: 'auth.userTrust.editDefaultTrustList',
    method: require(path.normalize(__dirname + '/editDefaultTrustList')),
    options: { callback: false }
  },
  {
    name: 'auth.userTrust.getDefaultTrustList',
    method: require(path.normalize(__dirname + '/getDefaultTrustList')),
    options: { callback: false }
  }
];
