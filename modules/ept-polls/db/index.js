var path = require('path');

module.exports = {
  byThread: require(path.normalize(__dirname + '/byThread')),
  create: require(path.normalize(__dirname + '/create')),
  exists: require(path.normalize(__dirname + '/exists')),
  vote: require(path.normalize(__dirname + '/vote')),
  removeVote: require(path.normalize(__dirname + '/removeVote')),
  hasVoted: require(path.normalize(__dirname + '/hasVoted')),
  lock: require(path.normalize(__dirname + '/lock')),
  isLocked: require(path.normalize(__dirname + '/isLocked')),
  isRunning: require(path.normalize(__dirname + '/isRunning')),
  maxAnswers: require(path.normalize(__dirname + '/maxAnswers')),
  answers: require(path.normalize(__dirname + '/answers')),
  changeVote: require(path.normalize(__dirname + '/changeVote')),
  update: require(path.normalize(__dirname + '/update'))
};
