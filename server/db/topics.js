'use strict';
var config = require(__dirname + '/../config');
var _ = require('lodash');
var nano = require('nano')({
  url: config.couchdb.url,
  log: function (id, args) {
    console.log(id, args);
  }
});

var topics = {};
var dbName = config.couchdb.dbName;
var recordType = 'topics';
var couch = nano.use(config.couchdb.dbName);

module.exports = topics;

topics.all = function(limit, startkey, cb) {
  var filter = {};
  filter.limit = limit ? Number(limit) + 1 : 11;
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

topics.byBoard = function(boardId, limit, startkey_docid, cb) {
  var filter = {};
  filter.key = Number(boardId);
  if (startkey_docid) { 
    filter.startkey_docid = startkey_docid;
  }
  filter.limit = limit ? Number(limit) + 1 : 11;
  couch.view(dbName, recordType + 'ByBoard', filter, function(err, docs) {
    delete docs.total_rows;
    docs.next_startkey = docs.rows[docs.rows.length - 1].key;
    docs.next_startkey_docid = docs.rows[docs.rows.length - 1].id; 
    docs.rows = _.first(docs.rows, filter.limit - 1);
    cb(err, docs);
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
