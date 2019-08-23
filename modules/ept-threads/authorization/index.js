var path = require('path');

module.exports = [
  {
    name: 'auth.threads.create',
    method: require(path.normalize(__dirname + '/create'))
  },
  {
    name: 'auth.threads.byBoard',
    method: require(path.normalize(__dirname + '/byBoard'))
  },
  {
    name: 'auth.threads.metaByBoard',
    method: require(path.normalize(__dirname + '/metaByBoard'))
  },
  {
    name: 'auth.threads.posted',
    method: require(path.normalize(__dirname + '/posted'))
  },
  {
    name: 'auth.threads.viewed',
    method: require(path.normalize(__dirname + '/viewed'))
  },
  {
    name: 'auth.threads.title',
    method: require(path.normalize(__dirname + '/title'))
  },
  {
    name: 'auth.threads.lock',
    method: require(path.normalize(__dirname + '/lock'))
  },
  {
    name: 'auth.threads.sticky',
    method: require(path.normalize(__dirname + '/sticky'))
  },
  {
    name: 'auth.threads.move',
    method: require(path.normalize(__dirname + '/move'))
  },
  {
    name: 'auth.threads.purge',
    method: require(path.normalize(__dirname + '/purge'))
  },
  {
    name: 'auth.threads.vote',
    method: require(path.normalize(__dirname + '/vote'))
  },
  {
    name: 'auth.threads.removeVote',
    method: require(path.normalize(__dirname + '/removeVote'))
  },
  {
    name: 'auth.threads.editPoll',
    method: require(path.normalize(__dirname + '/editPoll'))
  },
  {
    name: 'auth.threads.createPoll',
    method: require(path.normalize(__dirname + '/createPoll'))
  },
  {
    name: 'auth.threads.lockPoll',
    method: require(path.normalize(__dirname + '/lockPoll'))
  }
];
