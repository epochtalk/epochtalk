'use strict';
var _ = require('lodash');
var config = require(__dirname + '/../config');
var couch = require(__dirname + '/couch');
var dbName = config.couchdb.name;
var recordType = 'posts';

var posts = {};
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

posts.find = function(postId, cb) {
  var filter = {};
  filter.limit = 1;
  filter.key = Number(postId);
  couch.get(postId, null, function(err, result) {
    if (err || !result || result.type !== 'post') {
      err = new Error('Post not found.');
      result = undefined;
    }
    return cb(err, result);
  });
};

var defaultViewLimit = Number(10);

posts.byThread = function(parentPostId, query, cb) {
  // limit, startkey, startkey_docid, endkey, endkey_docid,
  var limit = query.limit;
  var startkey = query.startkey;

  var filter = {};
  filter.startkey = [parentPostId, null];
  filter.endkey = [parentPostId, {}];
  filter.include_docs = true;
  if (startkey) {
    // 2nd key is timestamps.created, a timestamp. query as a Number.
    startkey[1] = Number(startkey[1]);
    filter.startkey = startkey;
  }

  filter.limit = limit ? Number(limit) : defaultViewLimit;

  // +1 for couch pagination
  couch.view(dbName, recordType + 'ByThread', filter, function(err, docs) {
    if (!err && docs && docs.rows.length > 0) {
      delete docs.total_rows;
      delete docs.offset;
      docs.rows = _.map(docs.rows, function(row) {
        return row.doc;
      });
    }
    cb(err, docs);
  });
};
