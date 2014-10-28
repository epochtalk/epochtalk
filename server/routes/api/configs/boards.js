var core = require('epochcore')();
var Hapi = require('hapi');
var boardSchema = require('../schema/boards');

exports.create = {
  handler: function(request, reply) {
    // build the board object from payload
    var newBoard = {
      name: request.payload.name,
      description: request.payload.description,
      parent_id: request.payload.parent_id ? request.payload.parent_id : undefined
    };

    // create the board in core
    core.boards.create(newBoard)
    .then(function(board) {
      reply(board);
    })
    .catch(function(err) { reply(Hapi.error.internal()); });
  },
  validate: {
    payload: boardSchema.validate
  }
};

exports.find = {
  handler: function(request, reply) {
    core.boards.find(request.params.id)
    .then(function(board) {
      reply(board);
    })
    .catch(function(err) { reply(Hapi.error.internal()); });
  },
  validate: {
    params: boardSchema.validateId
  }
};

exports.all = {
  handler: function(request, reply) {
    core.boards.all()
    .then(function(boards) {
      reply(boards);
    })
    .catch(function(err) { reply(Hapi.error.internal()); });
  }
};

exports.allCategories = {
  handler: function(request, reply) {
    core.boards.allCategories()
    .then(function(boards) {
      reply(boards);
    })
    .catch(function(err) { reply(Hapi.error.internal()); });
  }
};

exports.updateCategories = {
  handler: function(request, reply) {
    // update board on core
    core.boards.updateCategories(request.payload.categories)
    .then(function(board) {
      reply(board);
    })
    .catch(function(err) {
      reply(err.message);
    });
  },
  validate: {
    payload: boardSchema.validateCategories
  }
};

exports.update = {
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
    .then(function(board) {
      reply(board);
    })
    .catch(function(err) { reply(Hapi.error.internal()); });
  },
  validate: {
    payload: boardSchema.validateUpdate,
    params: boardSchema.validateId
  }
};

exports.delete = {
  handler: function(request, reply) {
    core.boards.delete(request.params.id)
    .then(function(board) {
      reply(board);
    })
    .catch(function(err) { reply(Hapi.error.internal()); });
  },
  validate: {
    params: boardSchema.validateId
  }
};
