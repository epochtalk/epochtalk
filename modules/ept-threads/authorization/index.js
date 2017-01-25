var path = require('path');

module.exports = [
  {
    name: 'auth.threads.create',
    method: require(path.normalize(__dirname + '/create')),
    options: { callback: false }
  },
  {
    name: 'auth.threads.byBoard',
    method: require(path.normalize(__dirname + '/byBoard')),
    options: { callback: false }
  },
  {
    name: 'auth.threads.metaByBoard',
    method: require(path.normalize(__dirname + '/metaByBoard')),
    options: { callback: false }
  },
  {
    name: 'auth.threads.posted',
    method: require(path.normalize(__dirname + '/posted')),
    options: { callback: false }
  },
  {
    name: 'auth.threads.viewed',
    method: require(path.normalize(__dirname + '/viewed')),
    options: { callback: false }
  },
  {
    name: 'auth.threads.title',
    method: require(path.normalize(__dirname + '/title')),
    options: { callback: false }
  },
  {
    name: 'auth.threads.lock',
    method: require(path.normalize(__dirname + '/lock')),
    options: { callback: false }
  },
  {
    name: 'auth.threads.sticky',
    method: require(path.normalize(__dirname + '/sticky')),
    options: { callback: false }
  },
  {
    name: 'auth.threads.move',
    method: require(path.normalize(__dirname + '/move')),
    options: { callback: false }
  },
  {
    name: 'auth.threads.purge',
    method: require(path.normalize(__dirname + '/purge')),
    options: { callback: false }
  },
  {
    name: 'auth.threads.vote',
    method: require(path.normalize(__dirname + '/vote')),
    options: { callback: false }
  },
  {
    name: 'auth.threads.removeVote',
    method: require(path.normalize(__dirname + '/removeVote')),
    options: { callback: false }
  },
  {
    name: 'auth.threads.editPoll',
    method: require(path.normalize(__dirname + '/editPoll')),
    options: { callback: false }
  },
  {
    name: 'auth.threads.createPoll',
    method: require(path.normalize(__dirname + '/createPoll')),
    options: { callback: false }
  },
  {
    name: 'auth.threads.lockPoll',
    method: require(path.normalize(__dirname + '/lockPoll')),
    options: { callback: false }
  }
];
