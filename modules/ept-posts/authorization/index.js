var path = require('path');

module.exports = [
  {
    name: 'auth.posts.create',
    method: require(path.normalize(__dirname + '/create'))
  },
  {
    name: 'auth.posts.find',
    method: require(path.normalize(__dirname + '/find'))
  },
  {
    name: 'auth.posts.byThread',
    method: require(path.normalize(__dirname + '/byThread'))
  },
  {
    name: 'auth.posts.metaByThread',
    method: require(path.normalize(__dirname + '/metaByThread'))
  },
  {
    name: 'auth.posts.update',
    method: require(path.normalize(__dirname + '/update'))
  },
  {
    name: 'auth.posts.delete',
    method: require(path.normalize(__dirname + '/delete'))
  },
  {
    name: 'auth.posts.search',
    method: require(path.normalize(__dirname + '/search'))
  },
  {
    name: 'auth.posts.purge',
    method: require(path.normalize(__dirname + '/purge'))
  },
  {
    name: 'auth.posts.lock',
    method: require(path.normalize(__dirname + '/lock'))
  },
  {
    name: 'auth.posts.pageByUser',
    method: require(path.normalize(__dirname + '/pageByUser'))
  }
];
