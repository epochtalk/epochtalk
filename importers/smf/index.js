'use strict';
var mysql = require('mysql');
var nano = require('nano')('http://localhost:5984');
var connection = mysql.createConnection({
  host: 'localhost',
  port: 3306,
  database: 'smf',
  user: 'root',
  password: ''
});

var start = function(dbName, cb) {
  var db = nano.use(dbName);
  connection.connect();
  connection.query('select * from smf_boards', function(err, rows) {
    if (err) throw err;
    rows.forEach(function(row) {
      var board = {};
      board.type = 'board';
      board.title = row.name;
      board.description = row.description;
      board.smf_contents = row;
      db.insert(board, function(err, body) {
        console.log('board: ' + body.id);
        var boardId = body.id;
        connection.query('select * from smf_topics where ID_BOARD = ' + row.ID_BOARD,  function(err, rows) {
          console.log('importing topics as threads of board: ' + row.ID_BOARD);
          if (err) console.log(err);
          rows.forEach(function(row) {
            var thread = {};
            thread.board_id = boardId;
            thread.type = 'thread';
            thread.smf_contents = row;
            db.insert(thread, function(err, body) {
              var threadId = body.id;
              connection.query('select * from smf_messages where ID_TOPIC = ' + row.ID_TOPIC, function(err, rows) {
                console.log('importing messages as posts of topic: ' + row.ID_TOPIC);
                if (err) console.log(err);
                rows.forEach(function(row) {
                  var post = {};
                  post.type = 'post';
                  post.thread_id = threadId;
                  post.subject = row.subject;
                  post.body = row.body;
                  post.created_at = row.posterTime;
                  post.smf_contents = row;
                  db.insert(post, function(err, body) {
                    console.log('imported post: ' + body.id);
                  });
                });
              });
            });
          });
        });
      });
    });
  });
};

module.exports = {
  start: start
};
