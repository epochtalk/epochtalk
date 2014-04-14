'use strict';
var config = require(__dirname + '/../config');
var _ = require('underscore');
var nano = require('nano')(config.couchdb.url);
var boards = {};
var dbName = config.couchdb.dbName;
var recordType = 'boards';
var couch = nano.use(config.couchdb.dbName);

module.exports = boards;

boards.all = function(cb) {
  couch.view(dbName, recordType, {limit: 11}, function(err, body) {
    var result = _.first(body.rows, 10);
    result.next_startkey = body.rows[body.rows.length - 1].key;
    result.next_startkey_docid = body.rows[body.rows.length - 1].id;
    cb(err, result);
  });
};

boards.find = function(boardId, cb) {
  couch.view(dbName, recordType, { key: boardId }, function(err, body) {
    var board;
    if (!err && body.rows && body.rows.length > 0) {
      board = body.rows[0].value;
    }
    return cb(err, board);
  });
};


