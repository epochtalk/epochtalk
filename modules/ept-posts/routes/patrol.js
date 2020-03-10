var Joi = require('@hapi/joi');
var path = require('path');
var common = require(path.normalize(__dirname + '/../common'));

module.exports = {
  method: 'GET',
  path: '/api/posts/patrol',
  options: {
    auth: { strategy: 'jwt' },
    validate: {
      query: Joi.object({
        page: Joi.number().integer().min(1),
        limit: Joi.number().integer().min(1).max(100).default(25)
      }).without('start', 'page')
    },
    pre: [
      //{ method: (request) => request.server.methods.auth.posts.patrol(request.auth), assign: 'viewables' },
      { method: (request) => request.server.methods.hooks.preProcessing(request) },
      [
        { method: (request) => request.server.methods.hooks.parallelProcessing(request), assign: 'parallelProcessed' },
        { method: processing, assign: 'processed' },
      ],
      { method: (request) => request.server.methods.hooks.merge(request) },
      { method: (request) => request.server.methods.common.posts.parseOut(request.parser, request.pre.processed.posts) },
      { method: (request) => request.server.methods.hooks.postProcessing(request) }
    ],
    handler: function(request) {
      return request.pre.processed;
    }
  }
};

function processing(request) {
  // ready parameters
  var opts = {
    page: request.query.page,
    limit: request.query.limit,
    priority: request.server.plugins.acls.getUserPriority(request.auth)
  };
  // retrieve posts for this thread
  var promise = request.db.posts.patrol(request, opts)
  .error(request.errorMap.toHttpError);

  return promise;
}

