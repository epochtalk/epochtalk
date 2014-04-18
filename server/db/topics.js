'use strict';
var config = require(__dirname + '/../config');
var _ = require('underscore');
var nano = require('nano')(config.couchdb.url);
var topics = {};
var dbName = config.couchdb.dbName;
var recordType = 'topics';
var couch = nano.use(config.couchdb.dbName);

module.exports = topics;

topics.all = function(limit, startkey, cb) {
  var filter = {};
  filter.limit = limit ? Number(limit) : 10;
  if (startkey) filter.startkey = startkey;
  console.log(dbName + ' ' + recordType);
  couch.view(dbName, recordType, filter, function(err, result) {
    delete result.total_rows;
    result.next_startkey = result.rows[result.rows.length - 1].key;
    result.next_startkey_docid = result.rows[result.rows.length - 1].id; 
    result.rows = _.first(result.rows, filter.limit - 1);
    cb(err, result);
  });
};

topics.byBoard = function(boardId, limit, startkey, cb) {
  var filter = {};
  filter.boardId = boardId;
  filter.limit = limit ? Number(limit) : 10;
  if (startkey) filter.startkey = startkey;
  couch.view(dbName, recordType + 'ByBoard', filter, function(err, result) {
    delete result.total_rows;
    result.next_startkey = result.rows[result.rows.length - 1].key;
    result.next_startkey_docid = result.rows[result.rows.length - 1].id; 
    result.rows = _.first(result.rows, filter.limit - 1);
    cb(err, result);
  });
};

topics.find = function(topicId, cb) {
  couch.view(dbName, recordType, { key: topicId }, function(err, docs) {
    if (!err  && docs.rows && docs.rows.length > 0) {
      var topic = docs.rows[0].value;
      return cb(err, topic);
    }
    return cb(err, undefined);
  });
};
