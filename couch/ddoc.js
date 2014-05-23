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
    if (doc.type === 'board' && !doc.parent_board_id) {
      emit([doc._id], doc);
    }
    else if (doc.type === 'board' && doc.parent_board_id) {
      emit([doc.parent_board_id, doc._id], doc);
    }
  }
};

ddoc.views.posts = {
  map: function(doc) {
    if (doc.type === 'post' && !doc.parent_post_id) {
      emit([doc._id], doc);
    }
    else if (doc.type === 'post' && doc.parent_post_id) {
      emit([doc.parent_post_id, doc._id], doc);
    }
  }
};

ddoc.views.users = {
  map: function(doc) {
    if (doc.type === 'user') emit(doc._id, doc);
  }
};

ddoc.views.postByBoard = {
  map: function(doc) {
    if (doc.type === 'post' && !doc.parent_post_id) {
      emit([doc._id, doc.board_id], doc);
    }
  }
};

ddoc.views.postsByParentPost = {
  map: function(doc) {
    if (doc.type === 'post' && doc.parent_post_id) {
      emit([doc.parent_post_id, doc.timestamps.created, doc._id], doc);
    }
    else if (doc.type === 'post' && !doc.parent_post_id) {
      emit([doc._id, doc.timestamps.created], doc);
    }
  }
};

