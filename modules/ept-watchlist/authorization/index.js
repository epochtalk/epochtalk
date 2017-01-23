var path = require('path');

module.exports = [
  {
    name: 'auth.watchlist.unread',
    method: require(path.normalize(__dirname + '/unread')),
    options: { callback: false }
  },
  {
    name: 'auth.watchlist.edit',
    method: require(path.normalize(__dirname + '/edit')),
    options: { callback: false }
  },
  {
    name: 'auth.watchlist.pageThreads',
    method: require(path.normalize(__dirname + '/pageThreads')),
    options: { callback: false }
  },
  {
    name: 'auth.watchlist.pageBoards',
    method: require(path.normalize(__dirname + '/pageBoards')),
    options: { callback: false }
  },
  {
    name: 'auth.watchlist.watchBoard',
    method: require(path.normalize(__dirname + '/watchBoard')),
    options: { callback: false }
  },
  {
    name: 'auth.watchlist.unwatchBoard',
    method: require(path.normalize(__dirname + '/unwatchBoard')),
    options: { callback: false }
  },
  {
    name: 'auth.watchlist.watchThread',
    method: require(path.normalize(__dirname + '/watchThread')),
    options: { callback: false }
  },
  {
    name: 'auth.watchlist.unwatchThread',
    method: require(path.normalize(__dirname + '/unwatchThread')),
    options: { callback: false }
  },
];
