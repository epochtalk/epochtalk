'use strict';
var _ = require('lodash');
var config = require(__dirname + '/../config');
var couch = require(__dirname + '/couch');
var dbName = config.couchdb.name;
var recordType = 'boards';

var boards = {};
module.exports = boards;

boards.all = function(cb) {
  var filter = {limit: 200};
  couch.view(dbName, recordType, filter, function(err, body) {
    if (!err && body.rows && body.rows.length > 0) {
      var result = _.map(body.rows, function(row) {
        delete row.value.smf_contents;
        return row.value;
      });
    }
    // result.next_startkey = body.rows[body.rows.length - 1].key;
    // result.next_startkey_docid = body.rows[body.rows.length - 1].id;
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


