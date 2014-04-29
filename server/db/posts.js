'use strict';
var config = require(__dirname + '/../config');
var _ = require('lodash');
var nano = require('nano')({
  url: config.couchdb.url,
  log: function (id, args) {
    console.log(id, args);
    console.log(decodeURI(args[0].headers.uri));
  }
});
var posts = {};
var dbName = config.couchdb.dbName;
var recordType = 'posts';
var couch = nano.use(config.couchdb.dbName);

module.exports = posts;

posts.all = function(limit, startkey, cb) {
  var filter = {};
  filter.limit = limit ? Number(limit) : 10;
  if (startkey) filter.startkey = startkey;
  couch.view(dbName, recordType, filter, function(err, result) {
    delete result.total_rows;
    result.next_startkey = result.rows[result.rows.length - 1].key;
    result.next_startkey_docid = result.rows[result.rows.length - 1].id; 
    result.rows = _.first(result.rows, filter.limit - 1);
    cb(err, result);
  });
};

posts.find = function(messageId, cb) {
  var filter = {};
  filter.limit = 1;
  filter.key = Number(messageId);
  couch.view(dbName, recordType, filter, function(err, result) {
    if (!err && result.rows && result.rows.length > 0) {
      return cb(err, result.rows[0].value);
    }
    return cb(err, undefined);
  });
};

posts.byThread = function(threadId, limit, startkey_docid, cb) {
  console.log('thread: ' + threadId);
  var filter = {};
  filter.descending = true;
  filter.startkey = [threadId, {}];
  filter.endkey = [threadId, null];
  // filter.descending = true;
  if (startkey_docid) { 
    filter.startkey_docid = startkey_docid;
  }
  filter.limit = limit ? Number(limit) + 1 : 11;
  couch.view(dbName, recordType + 'ByThread', filter, function(err, docs) {
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