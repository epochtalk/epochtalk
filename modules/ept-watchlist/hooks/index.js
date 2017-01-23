function watchingBoard(request) {
  var userId;
  var boardId = request.query.board_id;
  if (request.auth.isAuthenticated) { userId = request.auth.credentials.id; }

  return request.db.watchlist.isWatchingBoard(boardId, userId)
  .then((watched) => { return { path: 'board.watched', data: watched }; });
}

function watchingThread(request) {
  var userId;
  var threadId = request.query.thread_id;
  if (request.auth.isAuthenticated) { userId = request.auth.credentials.id; }

  return request.db.watchlist.isWatchingThread(threadId, userId)
  .then((watched) => { return { path: 'thread.watched', data: watched }; });
}

function watchThread(request) {
  var threadId = request.payload.thread_id;
  var userId = request.auth.credentials.id;

  request.db.watchlist.isWatchingThread(threadId, userId)
  .then(function(watching) {
    if (!watching) { request.db.watchlist.watchThread(userId, threadId); }
  });

  return;
}


module.exports = [
  { path: 'threads.byBoard.parallel', method: watchingBoard },
  { path: 'posts.byThread.parallel', method: watchingThread },
  { path: 'posts.create.post', method: watchThread }
];
