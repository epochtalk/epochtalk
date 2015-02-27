var path = require('path');
var db = require(path.join(__dirname, '..', '..', '..', 'db'));
var Hapi = require('hapi');
var Boom = require('boom');
var boardValidator = require('epochtalk-validator').api.boards;
var pre = require(path.join(__dirname, 'pre'));

// Route handlers/configs
exports.create = {
  auth: { mode: 'required', strategy: 'jwt' },
  validate: { payload: boardValidator.schema.create },
  pre: [
    { method: pre.clean },
    { method: pre.adminCheck }
  ],
  handler: function(request, reply) {
    db.boards.create(request.payload)
    .then(function(board) { reply(board); })
    .catch(function(err) { reply(Boom.badImplementation(err)); });
  }
};

exports.import = {
  // validate: { payload: boardValidator.schema.import },
  pre: [ { method: pre.clean } ],
  handler: function(request, reply) {
    db.boards.import(request.payload)
    .then(function(board) { reply(board); })
    .catch(function(err) {
      request.log('error', 'Import board: ' + JSON.stringify(err, ['stack', 'message'], 2));
      reply(Boom.badImplementation(err));
    });
  }
};

exports.find = {
  auth: { mode: 'try', strategy: 'jwt' },
  validate: { params: boardValidator.id },
  pre: [ { method: pre.requireLogin, assign: 'viewable' } ],
  handler: function(request, reply) {
    if (!request.pre.viewable) { return reply({}); }
    db.boards.find(request.params.id)
    .then(function(board) { reply(board); })
    .catch(function(err) { reply(Boom.badImplementation(err)); });
  }
};

exports.all = {
  auth: { mode: 'try', strategy: 'jwt' },
  pre: [ { method: pre.requireLogin, assign: 'viewable' } ],
  handler: function(request, reply) {
    if (!request.pre.viewable) { return reply([]); }
    db.boards.all()
    .then(function(boards) { reply(boards); })
    .catch(function(err) { reply(Boom.badImplementation(err)); });
  }
};

exports.allCategories = {
  auth: { mode: 'try', strategy: 'jwt' },
  pre: [ { method: pre.requireLogin, assign: 'viewable' } ],
  handler: function(request, reply) {
    if (!request.pre.viewable) { return reply([]); }
    db.boards.allCategories()
    .then(function(categories) { reply(categories); })
    .catch(function(err) {
      reply(Boom.badImplementation(err));
    });
  }
};

exports.updateCategories = {
  auth: { mode: 'required', strategy: 'jwt' },
  pre: [ { method: pre.adminCheck } ],
  validate: { payload: boardValidator.schema.categories },
  handler: function(request, reply) {
    // update board on db
    db.boards.updateCategories(request.payload.categories)
    .then(function(board) { reply(board); })
    .catch(function(err) { reply(Boom.badImplementation(err)); });
  }
};

exports.update = {
  auth: { mode: 'required', strategy: 'jwt' },
  validate: {
    payload: boardValidator.schema.update,
    params: boardValidator.schema.id
  },
  pre: [
    { method: pre.clean },
    { method: pre.adminCheck }
  ],
  handler: function(request, reply) {
    // build updateBoard object from params and payload
    var updateBoard = {
      id: request.params.id,
      name: request.payload.name,
      description: request.payload.description,
      children_ids: request.payload.children_ids,
      parent_id: request.payload.parent_id
    };

    // update board on db
    db.boards.update(updateBoard)
    .then(function(board) { reply(board); })
    .catch(function() { reply(Boom.badImplementation(err)); });
  }
};

exports.delete = {
  auth: { mode: 'required', strategy: 'jwt' },
  validate: { params: boardValidator.schema.id },
  handler: function(request, reply) {
    db.boards.delete(request.params.id)
    .then(function(board) { reply(board); })
    .catch(function() { reply(Boom.badImplementation(err)); });
  }
};
