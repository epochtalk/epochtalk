var core = require('epochcore')();
var Hapi = require('hapi');
var boardValidator = require('epoch-validator').api.boards;
var path = require('path');
var sanitize = require(path.join('..', '..', 'sanitize'));

// Pre
var pre = {
  clean: function(request, reply) {
    request.payload.name = sanitize.strip(request.payload.name);
    if (request.payload.description) {
      request.payload.description = sanitize.display(request.payload.description);
    }
    return reply();
  }
};

// Route handlers/configs
var boards = {};
boards.create = {
  auth: { mode: 'required', strategy: 'jwt' },
  validate: { payload: boardValidator.schema.create },
  pre: [ { method: pre.clean } ],
  handler: function(request, reply) {
    core.boards.create(request.payload)
    .then(function(board) { reply(board); })
    .catch(function() { reply(Hapi.error.internal()); });
  }
};

boards.import = {
  // validate: { payload: boardValidator.schema.import },
  pre: [ { method: pre.clean } ],
  handler: function(request, reply) {
    core.boards.import(request.payload)
    .then(function(board) { reply(board); })
    .catch(function(err) { reply(err); });
  }
};

boards.find = {
  validate: { params: boardValidator.id },
  handler: function(request, reply) {
    core.boards.find(request.params.id)
    .then(function(board) { reply(board); })
    .catch(function() { reply(Hapi.error.internal()); });
  }
};

boards.all = {
  handler: function(request, reply) {
    core.boards.all()
    .then(function(boards) { reply(boards); })
    .catch(function() { reply(Hapi.error.internal()); });
  }
};

boards.allCategories = {
  handler: function(request, reply) {
    core.boards.allCategories()
    .then(function(categories) { reply(categories); })
    .catch(function() { reply(Hapi.error.internal()); });
  }
};

boards.updateCategories = {
  auth: { mode: 'required', strategy: 'jwt' },
  validate: { payload: boardValidator.schema.categories },
  handler: function(request, reply) {
    // update board on core
    core.boards.updateCategories(request.payload.categories)
    .then(function(board) { reply(board); })
    .catch(function(err) { reply(err.message); });
  }
};

boards.update = {
  auth: { mode: 'required', strategy: 'jwt' },
  validate: {
    payload: boardValidator.schema.update,
    params: boardValidator.schema.id
  },
  pre: [ { method: pre.clean } ],
  handler: function(request, reply) {
    // build updateBoard object from params and payload
    var updateBoard = {
      id: request.params.id,
      name: request.payload.name,
      description: request.payload.description,
      children_ids: request.payload.children_ids,
      parent_id: request.payload.parent_id
    };

    // update board on core
    core.boards.update(updateBoard)
    .then(function(board) { reply(board); })
    .catch(function() { reply(Hapi.error.internal()); });
  }
};

boards.delete = {
  auth: { mode: 'required', strategy: 'jwt' },
  validate: { params: boardValidator.schema.id },
  handler: function(request, reply) {
    core.boards.delete(request.params.id)
    .then(function(board) { reply(board); })
    .catch(function() { reply(Hapi.error.internal()); });
  }
};

// Export Routes/Pre
exports.routes = [
  // CREATE BOARD
  { method: 'POST', path: '/boards', config: boards.create },
  // GET SINGLE BOARD
  { method: 'GET', path: '/boards/{id}', config: boards.find },
  // GET ALL BOARDS
  { method: 'GET', path: '/boards/all', config: boards.all },
  // GET ALL BOARDS IN CATEGORY
  { method: 'GET', path: '/boards', config: boards.allCategories },
  // UPDATE BOARDS AND CATEGORIES
  { method: 'POST', path: '/boards/categories', config: boards.updateCategories },
  // UPDATE BOARD
  { method: 'POST', path: '/boards/{id}', config: boards.update },
  // DELETE BOARD (should delete all threads?)
  { method: 'DELETE', path: '/boards/{id}', config: boards.delete },
  // POST IMPORT
  { method: 'POST', path: '/boards/import', config: boards.import }
];

exports.pre = pre;
