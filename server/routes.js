var db = require('./db');

var configureRoutes = function(app) {
  app.get('/', function(req, res){
    return res.sendfile('index.html', {root: './public'});
  });

  app.get('/api/boards', function(req, res) {
    db.boards.all(function(err, boards) {
      return res.json(boards);
    });
  });

  app.get('/api/boards/:boardId', function(req, res) {
    db.boards.find(req.params.boardId, function(err, board) {
      return res.json(board);
    });
  });

  app.get('/api/boards/:boardId/threads', function(req, res) {
    if (req.params.boardId) {
      db.threads.byBoard(req.params.boardId, req.params.limit, req.params.startkey, req.params.startkey_docid, function(err, threads) {
        return res.json(threads);
      });
    }
    else {
      db.threads.all(req.query.limit, req.query.startkey, function(err, threads) {
        return res.json(threads);
      });
    }
  });

  app.get('/api/threads/:threadId', function(req, res) {
    db.threads.find(req.params.threadId, function(err, thread) {
      return res.json(thread);
    });
  });

  app.get('/api/threads/:threadId/posts', function(req, res) {
    var handler = function(err, posts) {
      return res.json(posts);
    };
    if (req.params.threadId) {
      db.posts.byThread(req.params.threadId, req.query.limit, req.query.startkey, req.query.startkey_docid, handler);
    }
    else {
      db.posts.all(handler);
    }
  });
}

module.exports = configureRoutes;
