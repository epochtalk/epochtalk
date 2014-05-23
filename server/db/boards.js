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
        delete row.value.type;
        return row.value;
      });
    }
    cb(err, result);
  });
};

boards.find = function(boardId, cb) {
  couch.view(dbName, recordType, { key: boardId }, function(err, body) {
    var board;
    if (!err && body.rows && body.rows.length > 0) {
      board = body.rows[0].value;
      delete board.type;
    }
    return cb(err, board);
  });
};


