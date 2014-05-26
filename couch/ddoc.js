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
    if (doc.type === 'board') {
      emit(doc._id, doc);
    }
  }
};

ddoc.views.threadsByBoard = {
  map: function(doc) {
    if (doc.type === 'post' && !doc.parent_post_id) {
      emit([doc.board_id, doc.timestamps.created], doc);
    }
  }
};

ddoc.views.users = {
  map: function(doc) {
    if (doc.type === 'user') emit(doc._id, doc);
  }
};

ddoc.views.usersByEmail = {
  map: function(doc) {
    if (doc.type === 'user') emit(doc.email, null);
  }
};

ddoc.views.postByBoard = {
  map: function(doc) {
    if (doc.type === 'post' && !doc.parent_post_id) {
      emit([doc._id, doc.board_id], doc);
    }
  }
};

ddoc.views.postsByThread = {
  map: function(doc) {
    if (doc.type === 'post') {
      emit([doc.parent_post_id ? doc.parent_post_id : doc._id, doc.timestamps.created]);
    }
  }
};


