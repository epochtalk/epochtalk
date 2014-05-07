'use strict';
var _ = require('lodash');
var config = require(__dirname + '/../config');
var couch = require(__dirname + '/couch');
var dbName = config.couchdb.name;
var recordType = 'threads';

var threads = {};
module.exports = threads;

threads.all = function(limit, startkey, cb) {
  var filter = {};
  filter.limit = limit ? Number(limit) + 1 : 11;
  if (startkey) filter.startkey = startkey;
  couch.view(dbName, recordType, filter, function(err, result) {
    delete result.total_rows;
    result.next_startkey = result.rows[result.rows.length - 1].key;
    result.next_startkey_docid = result.rows[result.rows.length - 1].id; 
    result.rows = _.first(result.rows, filter.limit - 1);
    cb(err, result);
  });
};

threads.byBoard = function(boardId, limit, startkey_docid, cb) {
  var filter = {};
  filter.key = boardId;
  if (startkey_docid) { 
    filter.startkey_docid = startkey_docid;
  }
  filter.limit = limit ? Number(limit) + 1 : 11;
  console.log(filter);
  couch.view(dbName, recordType + 'ByBoard', filter, function(err, docs) {
    if (!err && docs && docs.rows.length > 0) {
      delete docs.total_rows;
      docs.next_startkey = docs.rows[docs.rows.length - 1].key;
      docs.next_startkey_docid = docs.rows[docs.rows.length - 1].id; 
      docs.rows = _.map(docs.rows, function(row) {
        return row.value;
      });
    }
    cb(err, docs);
  });
};

threads.find = function(threadId, cb) {
  couch.view(dbName, recordType, { key: threadId }, function(err, docs) {
    if (!err  && docs.rows && docs.rows.length > 0) {
      var thread = docs.rows[0].value;
      return cb(err, thread);
    }
    return cb(err, undefined);
  });
};
