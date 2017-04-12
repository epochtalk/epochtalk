var Boom = require('boom');
var Promise = require('bluebird');

/**
  * @apiVersion 0.4.0
  * @apiGroup Portal
  * @api {GET} /portal Portal Contents
  * @apiName ViewPortal
  * @apiDescription Used to retrieve the portal contents.
  * @apiSuccess {object} containing board: [array of threads from a single board]
  *
  * @apiError (Error 500) InternalServerError There was an issue retrieving portal content.
  */
module.exports = {
  method: 'GET',
  path: '/api/portal',
  config: {
    app: { hook: 'portal.view' },
    auth: { mode: 'try', strategy: 'jwt' },
    pre: [
      { method: 'auth.portal.view(server, auth)', assign: 'priority' },
      { method: 'hooks.preProcessing' },
      [
        { method: 'hooks.parallelProcessing', assign: 'parallelProcessed' },
        { method: processing, assign: 'processed' },
      ],
      { method: 'hooks.merge' },
      { method: 'hooks.postProcessing' }
    ]
  },
  handler: function(request, reply) {
    return reply(request.pre.processed);
  }
};


function processing(request, reply) {
  var config = request.server.app.config;
  var boardId = config.portal.boardId;
  if (!boardId) { return reply(Boom.badRequest('Board Not Set routes')); }

  var userId;
  var opts = { limit: 10, page: 1 };
  var priority = request.pre.priority;
  if (request.auth.isAuthenticated) { userId = request.auth.credentials.id; }

  var getBoard = request.db.boards.find(boardId, priority);
  var getThreads = request.db.portal.threads(boardId, userId, opts);
  var getRecentThreads = request.db.threads.recent(userId, priority, opts);

  var promise = Promise.join(getBoard, getThreads, getRecentThreads, function(board, threads, recent) {
    return {
      board: board,
      threads: threads,
      recent: recent
    };
  });
  return reply(promise);
}
