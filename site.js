var express = require('express');
var RedisStore = require('connect-redis')(express);
var config = require('./config');
var app = express();
var engines = require('consolidate');
var db = require('./db');

app.engine('haml', engines.haml);
app.set('view engine', 'haml');
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.cookieParser('adness'));
app.use(express.bodyParser());
app.use(express.methodOverride());
app.use(express.json());
app.use(express.urlencoded());
app.use(express.session({
  store: new RedisStore({
    host: config.redis.host,
    port: config.redis.port,
  }),
  cookie: {
    secure: false,
    maxAge:86400000
  }
}));

app.get('/', function(req, res){
  return res.render('home', {greeting: 'asdf'});
});

app.get('/api/boards', function(req, res) {
  db.findBoards(function(err, boards) {
    return res.json(boards);
  });
});

app.get('/api/boards/:boardId', function(req, res) {
  db.findBoard(req.params.boardId, function(err, board) {
    return res.json(board);
  });
});

app.get('/api/topics', function(req, res) {
  db.findTopics(req.query.limit, req.query.startkey, function(err, topics) {
    return res.json(topics);
  });
});

app.get('/api/topics/:topicId', function(req, res) {
  db.findTopic(req.params.topicId, function(err, topic) {
    return res.json(topic);
  });
});

app.get('/api/messages', function(req, res) {
  db.findMessages(function(err, messages) {
    return res.json(messages);
  });
});

app.get('/api/messages/:messageId', function(req, res) {
  res.json({message: 'asdf'});
});




module.exports = app;
