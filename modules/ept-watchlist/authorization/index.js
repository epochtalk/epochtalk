var path = require('path');

module.exports = [
  {
    name: 'auth.watchlist.unread',
    method: require(path.normalize(__dirname + '/unread'))
  },
  {
    name: 'auth.watchlist.edit',
    method: require(path.normalize(__dirname + '/edit'))
  },
  {
    name: 'auth.watchlist.pageThreads',
    method: require(path.normalize(__dirname + '/pageThreads'))
  },
  {
    name: 'auth.watchlist.pageBoards',
    method: require(path.normalize(__dirname + '/pageBoards'))
  },
  {
    name: 'auth.watchlist.watchBoard',
    method: require(path.normalize(__dirname + '/watchBoard'))
  },
  {
    name: 'auth.watchlist.unwatchBoard',
    method: require(path.normalize(__dirname + '/unwatchBoard'))
  },
  {
    name: 'auth.watchlist.watchThread',
    method: require(path.normalize(__dirname + '/watchThread'))
  },
  {
    name: 'auth.watchlist.unwatchThread',
    method: require(path.normalize(__dirname + '/unwatchThread'))
  },
];
