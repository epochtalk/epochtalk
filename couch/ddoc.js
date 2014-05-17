'use strict';
var couchapp = require('couchapp'),
    path = require('path');

var ddoc = {
  _id: '_design/epoch',
  views: {},
  lists: {},
  shows: {},
};

module.exports = ddoc;

ddoc.views.boards = {
  map: function(doc) {
    if (doc.type === 'board') emit(doc._id, doc);
  }
};

ddoc.views.posts = {
  map: function(doc) {
    if (doc.type === 'post') emit(doc._id, doc);
  }
};

ddoc.views.threadsByBoard = {
  map: function(doc) {
    if (doc.type === 'thread') emit(doc.board_id, doc);
  }
};

ddoc.views.postsByThread = {
  map: function(doc) {
    if (doc.type === 'post') emit([doc.thread_id, doc.created_at], doc);
  }
};

