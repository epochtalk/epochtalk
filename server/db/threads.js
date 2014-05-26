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
  limit = limit ? Number(limit) : defaultViewLimit;
  filter.limit = limit + 1;
  
  if (startkey) filter.startkey = startkey;
  couch.view(dbName, recordType, filter, function(err, result) {
    delete result.total_rows;
    result.next_startkey = result.rows[result.rows.length - 1].key;
    result.next_startkey_docid = result.rows[result.rows.length - 1].id;
    result.rows = _.first(result.rows, filter.limit - 1);
    cb(err, result);
  });
};

var defaultViewLimit = Number(10);

threads.byBoard = function(boardId, limit, key, startkey_docid, cb) {
  var filter = {};
  if (key && startkey_docid) {
    filter.key = boardId;
    filter.startkey_docid = startkey_docid;
  }
  
  limit = limit ? Number(limit) : defaultViewLimit;
  filter.limit = limit + 1;
  couch.view(dbName, recordType + 'ByBoard', filter, function(err, docs) {
    if (!err && docs && docs.rows.length > 0) {
      delete docs.total_rows;
      delete docs.offset;
      docs.next_startkey = docs.rows[docs.rows.length - 1].key;
      docs.next_startkey_docid = docs.rows[docs.rows.length - 1].id;
      docs.rows = _.map(docs.rows, function(row) {
        delete row.value.type;
        return row.value;
      });
    }
    cb(err, docs);
  });
};


var postsPerPage = 10;
threads.find = function(parentPostId, cb) {
  var filter = {};
  filter.startkey = [parentPostId, null];
  filter.endkey = [parentPostId, {}];

  var thread = {};
  thread.paged_post_keys = [];

  // first post for thread
  couch.get(parentPostId, {}, function(err, doc) {
    var post = doc;
    delete post.type;
    thread.firstPost = post;
    // Build key for first page
    var firstPageKey = [post._id, post.timestamps.created];
    thread.paged_post_keys.push(firstPageKey);
    if (!err) {
      couch.view(dbName, 'postsByThread', filter, function(err, doc) {
        // want 10th, 20th, 30th, 40th
        var rowsCount = doc.rows.length;
        var pagesCount = Math.floor(rowsCount / 10);
        var index = 1;
        if (pagesCount > 1) {
          _.times(pagesCount, function() {
            var pageFirstIndex = index * postsPerPage;
            var pageFirstPost = doc.rows[pageFirstIndex];
            thread.paged_post_keys.push(pageFirstPost.key);
            index++;
          });
        }
        thread.page_count = thread.paged_post_keys.length;
        // + 1 for initial post
        thread.total_posts_count = rowsCount + 1;
        return cb(err, thread);
      });
    }
  });
};
