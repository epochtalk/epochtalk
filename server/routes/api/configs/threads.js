var core = require('epochcore')();
var threadSchema = require('../schema/threads');

exports.create = {
  handler: function(request, reply) {
    // build the thread post object from payload and params
    var newThread = {
      title: request.payload.title,
      body: request.payload.body,
      board_id: request.payload.board_id
    };

    // create the thread in core
    core.threads.create(newThread)
    .then(function(thread) {
      reply(thread);
    })
    .catch(function(err) {
      reply(err.message);
    });
  },
  validate: {
    payload: threadSchema.validate
  }
};

exports.byBoard = {
  handler: function(request, reply) {
    var boardId = request.query.board_id || request.params.board_id;
    var opts = {
      limit: request.query.limit || request.params.limit,
      page: request.query.page || request.params.page
    };
    console.log(boardId);
    console.log(opts);
    core.threads.byBoard(boardId, opts)
    .then(function(threads) {
      reply(threads);
    })
    .catch(function(err) {
      reply(err.message);
    });
  },
  validate: {
    params: threadSchema.validateByBoard,
    query: threadSchema.validateByBoard
  }
};

exports.find = {
  handler: function(request, reply) {
    var threadId = request.params.id || request.query.id;
    core.threads.find(threadId)
    .then(function(thread) {
      reply(thread);
    })
    .catch(function(err) {
      reply(err.message);
    });
  }
};
