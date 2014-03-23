var couchapp = require('couchapp'),
    path = require('path');

ddoc = {
  _id: '_design/tng',
  views: {},
  lists: {},
  shows: {} 
}

module.exports = ddoc;

ddoc.views.boards = {
  map: function(doc) {
    if (doc.type === 'board')
      emit(doc._id, doc);
  },
  reduce: '_count'
}

ddoc.views.topics = {
  map: function(doc) {
    if (doc.type === 'topic')
      emit(doc._id, doc);
  },
  reduce: '_count'
}

ddoc.views.messages = {
  map: function(doc) {
    if (doc.type === 'message')
      emit(doc._id, doc);
  },
  reduce: '_count'
}

