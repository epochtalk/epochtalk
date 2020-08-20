var path = require('path');

module.exports = [
  require(path.normalize(__dirname + '/byBoard')),
  require(path.normalize(__dirname + '/create')),
  require(path.normalize(__dirname + '/createPoll')),
  require(path.normalize(__dirname + '/editPoll')),
  require(path.normalize(__dirname + '/lock')),
  require(path.normalize(__dirname + '/lockPoll')),
  require(path.normalize(__dirname + '/meta-byBoard')),
  require(path.normalize(__dirname + '/move')),
  require(path.normalize(__dirname + '/posted')),
  require(path.normalize(__dirname + '/purge')),
  require(path.normalize(__dirname + '/removeVote')),
  require(path.normalize(__dirname + '/sticky')),
  require(path.normalize(__dirname + '/slugToThreadId')),
  require(path.normalize(__dirname + '/title')),
  require(path.normalize(__dirname + '/viewed')),
  require(path.normalize(__dirname + '/vote'))
];
