var express = require('express');
var db = require(__dirname + '/../db');
var api = express.Router();
var passport = require(__dirname + '/../passport');
require(__dirname + '/users')(api);

api.route('/boards')
.get(function(req, res) {
  console.log(req.user);
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
  console.log('-- get threads');
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

api.route('/threads/:parentPostId')
.get(function(req, res) {
  db.threads.find(req.params.parentPostId, function(err, threadMeta) {
    return res.json(threadMeta);
  });
});

api.route('/threads/:parentPostId/posts')
.get(function(req, res) {
  var handler = function(err, posts) {
    return res.json(posts);
  };
  if (req.params.parentPostId) {
    db.posts.byThread(req.params.parentPostId, req.query, handler);
  }
  else {
    db.posts.all(handler);
  }
});

api.route('/posts/:postId')
.get(function(req, res) {
  if (req.params.postId) {
    db.posts.find(req.params.postId, function(err, post) {
      if (!err) {
        delete post.type;
      }
      return res.json(post);
    });
  }
});

module.exports = api;
