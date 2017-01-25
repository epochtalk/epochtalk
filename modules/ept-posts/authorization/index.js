var path = require('path');

module.exports = [
  {
    name: 'auth.posts.create',
    method: require(path.normalize(__dirname + '/create')),
    options: { callback: false }
  },
  {
    name: 'auth.posts.find',
    method: require(path.normalize(__dirname + '/find')),
    options: { callback: false }
  },
  {
    name: 'auth.posts.byThread',
    method: require(path.normalize(__dirname + '/byThread')),
    options: { callback: false }
  },
  {
    name: 'auth.posts.metaByThread',
    method: require(path.normalize(__dirname + '/metaByThread')),
    options: { callback: false }
  },
  {
    name: 'auth.posts.update',
    method: require(path.normalize(__dirname + '/update')),
    options: { callback: false }
  },
  {
    name: 'auth.posts.delete',
    method: require(path.normalize(__dirname + '/delete')),
    options: { callback: false }
  },
  {
    name: 'auth.posts.search',
    method: require(path.normalize(__dirname + '/search')),
    options: { callback: false }
  },
  {
    name: 'auth.posts.purge',
    method: require(path.normalize(__dirname + '/purge')),
    options: { callback: false }
  },
  {
    name: 'auth.posts.lock',
    method: require(path.normalize(__dirname + '/lock')),
    options: { callback: false }
  },
  {
    name: 'auth.posts.pageByUser',
    method: require(path.normalize(__dirname + '/pageByUser')),
    options: { callback: false }
  }
];
