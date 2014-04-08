var config = require('./config');
var _ = require('underscore');
var nano = require('nano')(config.couchdb.url);
var couch = nano.use(config.couchdb.dbname);

var ddName = 'tng';
var exp = {
  findBoards: function(cb) {
    couch.view(ddName, 'boards', {limit: 11}, function(err, body) {
      var result = _.first(body.rows, 10);
      result.next_startkey = body.rows[body.rows.length - 1].key;
      result.next_startkey_docid = body.rows[body.rows.length - 1].id;
      cb(err, result);
    });
  },
  findBoard: function(boardId, cb) {
    couch.view(ddName, 'boards', { key: boardId }, function(err, body) {
      var board;
      if (!err && docs.rows && docs.rows.length > 0) {
        board = docs.rows[0].value;
      }
      return cb(err, board);
    });
  },
  findTopics: function(limit, startkey, cb) {
    console.log('limit: ' + limit);
    console.log('start: ' + startkey);

    var filter = {};
    if (limit) filter.limit = limit;
    if (startkey) filter.startkey = startkey;
    couch.view(ddName, 'topics', filter, function(err, result) {
      delete result.total_rows;
      result.next_startkey = result.rows[result.rows.length - 1].key;
      result.next_startkey_docid = result.rows[result.rows.length - 1].id; 
      result.rows = _.first(result.rows, limit - 1);
      cb(err, result);
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

