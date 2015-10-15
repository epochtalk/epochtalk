var path = require('path');
var watchlist = require(path.normalize(__dirname + '/config'));

// Export Routes/Pre
module.exports = [
  { method: 'GET', path: '/watchlist', config: watchlist.unread },
  { method: 'GET', path: '/watchlist/edit', config: watchlist.edit },
  { method: 'GET', path: '/watchlist/threads', config: watchlist.pageThreads },
  { method: 'GET', path: '/watchlist/boards', config: watchlist.pageBoards },
  { method: 'POST', path: '/watchlist/threads/{id}', config: watchlist.watchThread },
  { method: 'POST', path: '/watchlist/boards/{id}', config: watchlist.watchBoard },
  { method: 'DELETE', path: '/watchlist/threads/{id}', config: watchlist.unwatchThread },
  { method: 'DELETE', path: '/watchlist/boards/{id}', config: watchlist.unwatchBoard }
];
