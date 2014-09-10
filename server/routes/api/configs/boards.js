var core = require('epochcore')();
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
    .catch(function(err) {
      reply(err.message);
    });
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
    .catch(function(err) {
      reply(err.message);
    });
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
    .catch(function(err) {
      reply(err.message);
    });
  }
};

exports.update = {
  handler: function(request, reply) {
    // build updateBoard object from params and payload
    var updateBoard = {
      id: request.params.id,
      name: request.payload.name,
      description: request.payload.description
    };

    // update board on core
    core.boards.update(updateBoard)
    .then(function(board) {
      reply(board);
    })
    .catch(function(err) {
      reply(err.message);
    });
  },
  validate: {
    payload: boardSchema.validate,
    params: boardSchema.validateId
  }
};

exports.delete = {
  handler: function(request, reply) {
    core.boards.delete(request.params.id)
    .then(function(board) {
      reply(board);
    })
    .catch(function(err) {
      reply(err.message);
    });
  },
  validate: {
    params: boardSchema.validateId
  }
};
