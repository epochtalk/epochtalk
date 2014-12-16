var core = require('epoch-core-pg')();
var Hapi = require('hapi');
var boardValidator = require('epoch-validator').api.boards;
var path = require('path');
var pre = require(path.join(__dirname, 'pre'));

// Route handlers/configs
exports.create = {
  auth: { mode: 'required', strategy: 'jwt' },
  validate: { payload: boardValidator.schema.create },
  pre: [ { method: pre.clean } ],
  handler: function(request, reply) {
    core.boards.create(request.payload)
    .then(function(board) { reply(board); })
    .catch(function() { reply(Hapi.error.internal()); });
  }
};

exports.import = {
  // validate: { payload: boardValidator.schema.import },
  pre: [ { method: pre.clean } ],
  handler: function(request, reply) {
    core.boards.import(request.payload)
    .then(function(board) { reply(board); })
    .catch(function(err) { reply(err); });
  }
};

exports.find = {
  validate: { params: boardValidator.id },
  handler: function(request, reply) {
    core.boards.find(request.params.id)
    .then(function(board) { reply(board); })
    .catch(function() { reply(Hapi.error.internal()); });
  }
};

exports.all = {
  handler: function(request, reply) {
    core.boards.all()
    .then(function(boards) { reply(boards); })
    .catch(function() { reply(Hapi.error.internal()); });
  }
};

exports.allCategories = {
  handler: function(request, reply) {
    core.boards.allCategories()
    .then(function(categories) { reply(categories); })
    .catch(function(err) {
      console.log(err); 
      reply(Hapi.error.internal());
    });
  }
};

exports.updateCategories = {
  auth: { mode: 'required', strategy: 'jwt' },
  validate: { payload: boardValidator.schema.categories },
  handler: function(request, reply) {
    // update board on core
    core.boards.updateCategories(request.payload.categories)
    .then(function(board) { reply(board); })
    .catch(function(err) { reply(err.message); });
  }
};

exports.update = {
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

exports.delete = {
  auth: { mode: 'required', strategy: 'jwt' },
  validate: { params: boardValidator.schema.id },
  handler: function(request, reply) {
    core.boards.delete(request.params.id)
    .then(function(board) { reply(board); })
    .catch(function() { reply(Hapi.error.internal()); });
  }
};
