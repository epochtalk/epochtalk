var express = require('express');
var api = express.Router();
var passport = require(__dirname + '/../passport');
var _ = require('lodash');
require(__dirname + '/users')(api);

/* Dummy Data */

var boards = [
  {
    _id: 1,
    name: 'meta',
    title: 'meta',
    description: 'meta board',
    moderator_ids: ['111', '112', '113'],
    parent_board_id: undefined,
    timestamps: { created: 1 },
    type: 'board'
  },
  {
    _id: 2,
    name: 'new forum',
    title: 'New Forum',
    description: 'new forum board',
    moderator_ids: ['111', '112', '113'],
    parent_board_id: 1,
    timestamps: { created: 1 },
    type: 'board'
  },
  {
    _id: 3,
    name: 'general',
    title: 'General',
    description: 'general board',
    moderator_ids: ['111', '112', '113'],
    parent_board_id: undefined,
    timestamps: { created: 1 },
    type: 'board'
  }
];

var threads ={
  rows: [
    {
      _id: 111,
      subject: "halp",
      body: "body"
    },
    {
      _id: 111,
      subject: "ROFL"
    },
    {
      _id: 111,
      subject: "DERP"
    }
  ]
};

var posts = {
  rows: [
    {
      id: 211,
      subject: "subject",
      body: "body",
      author_id: 311,
      board_id: 1,
      parent_post_id: undefined,
      timestamps: { created: 1 },
      type: 'post'
    },
    {
      id: 212,
      subject: "subject",
      body: "body",
      author_id: 311,
      board_id: 1,
      parent_post_id: undefined,
      timestamps: { created: 1 },
      type: 'post'
    },
    {
      id: 213,
      subject: "subject",
      body: "body",
      author_id: 311,
      board_id: 1,
      parent_post_id: undefined,
      timestamps: { created: 1 },
      type: 'post'
    },
  ]
};

var post = {
  id: 211,
  subject: "subject",
  body: "body",
  author_id: 111,
  board_id: 1,
  paged_post_keys: [],
  parent_post_id: undefined,
  timestamps: { created: 1 },
  type: 'post'
};

var user = {
  _id: 311,
  username: "someUser",
  email: "someUser@someEmail.com",
  password: "password",
  confirm_password: "password",
  timestamps: { created: 1 },
  type: 'user'
};

/* End Dummy Data */

api.route('/boards')
.get(function(req, res) { return res.json(boards); });

api.route('/boards/:boardId')
.get(function(req, res) {
  var board = _.find(boards, function(board) {
    return board._id === Number(req.params.boardId);
  });
  console.log(board);
  return res.json(board);
});

api.route('/boards/:boardId/threads')
.get(function(req, res) {
  console.log('-- get threads');
  console.log(threads);
  return res.json(threads);
});

api.route('/threads/:parentPostId')
.get(function(req, res) {
  console.log('-- get parentPostId');
  return res.json(post); // threadMeta
});

api.route('/threads/:parentPostId/posts')
.get(function(req, res) { return res.json(posts); });

api.route('/posts/:postId')
.get(function(req, res) {
  if (req.params.postId) { return res.json(post); }
  else { return res.send(500, "error"); }
});

api.route('/profiles/:userId')
.get(function(req, res) { return res.json(user); });

api.route('/me')
.get(function(req, res) {
  res.json({success: true, email: "someUser@someEmail.com"});
});

module.exports = api;
