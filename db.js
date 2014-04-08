var config = require('./config');
var nano = require('nano')(config.couchdb.url);
var couch = nano.use(config.couchdb.dbname);

var ddName = 'tng';
var exp = {
  findBoards: function(cb) {
    couch.view(ddName, 'boards', {limit: 10}, function(err, body) {
      cb(err, body.rows);
    });
  },
  findBoard: function(boardId, cb) {
    couch.view(ddName, 'boards', { key: boardId }, function(err, body) {
      cb(err, body.rows);
    });
  },
  findTopics: function(cb) {
    couch.view(ddName, 'topics', {limit: 10}, function(err, body) {
      cb(err, body);
    });
  },
  findTopic: function(topicId, cb) {
    couch.view(ddName, 'topics', { key: topicId }, function(err, docs) {
      if (!err  && docs.rows && docs.rows.length > 0) {
        var topic = docs.rows[0].value;
        return cb(err, topic);
      }
      return cb(err, undefined);
    });
  },
  findMessages: function(cb) {
    couch.view(ddName, 'messagesByTopic', {limit: 10}, function(err, body) {
      cb(err, body);
    });
  }
};

module.exports = exp;

