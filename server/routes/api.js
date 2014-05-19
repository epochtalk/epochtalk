var express = require('express');
var db = require(__dirname + '/../db');
var api = express.Router();

require(__dirname + '/users')(api);

api.route('/boards').get(function(req, res) {
  db.boards.all(function(err, boards) {
    return res.json(boards);
  });
});

api.route('/boards/:boardId')
.get(function(req, res) {
  db.boards.find(req.params.boardId, function(err, board) {
    return res.json(board);
  });
});

api.route('/boards/:boardId/threads')
.get(function(req, res) {
  console.log('get threads');
  if (req.params.boardId) {
    db.threads.byBoard(req.params.boardId, req.query.limit, req.query.key, req.query.startkey_docid, function(err, threads) {
      return res.json(threads);
    });
  }
  else {
    db.threads.all(req.query.limit, req.query.startkey, function(err, threads) {
      return res.json(threads);
    });
  }
});

api.route('/threads/:threadId')
.get(function(req, res) {
  db.threads.find(req.params.threadId, function(err, thread) {
    return res.json(thread);
  });
});

api.route('/threads/:threadId/posts')
.get(function(req, res) {
  var handler = function(err, posts) {
    return res.json(posts);
  };
  if (req.params.threadId) {
    db.posts.byThread(req.params.threadId, req.query, handler);
  }
  else {
    db.posts.all(handler);
  }
});

module.exports = api;
