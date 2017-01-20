var Joi = require('joi');
var Boom = require('boom');

/**
  * @apiVersion 0.4.0
  * @apiGroup Threads
  * @api {GET} /threads Page By Board
  * @apiName PageThreadsByBoard
  * @apiDescription Used to page through a board's threads.
  *
  * @apiParam (Query) {string} board_id The board whose threads to page through
  * @apiParam (Query) {number} page=1 The page of threads to bring back
  * @apiParam (Query) {number} limit=25 The number of threads to bring back per page
  *
  * @apiSuccess {array} threads An array containing threads for the requested board, page and limit
  *
  * @apiError (Error 500) InternalServerError There was an issue retrieving the threads
  */
module.exports = {
  method: 'GET',
  path: '/boards/{board_id}',
  config: {
    app: { hook: 'threads.byBoard' },
    auth: { mode: 'try', strategy: 'jwt' },
    validate: { params: { board_id: Joi.string().required() } },
    pre: [
      { method: 'auth.threads.metaByBoard(server, auth, params.board_id)', assign: 'viewable' }
    ],
  },
  handler: function(request, reply) {
    var userPriority = request.server.plugins.acls.getUserPriority(request.auth);
    var viewable = request.pre.viewable;
    var boardId = request.params.board_id;
    var config = request.server.app.config;
    var data = {
      title: config.website.title,
      description: config.website.description,
      keywords: config.website.keywords,
      logo: config.website.logo,
      favicon: config.website.favicon,
      websocket_host: config.websocket_client_host,
      websocket_port: config.websocket_port,
      portal: { enabled: config.portal.enabled },
      GAKey: config.gaKey,
      currentYear: new Date().getFullYear()
    };

    return request.db.boards.find(boardId, userPriority)
    .then(function(board) {
      // Title
      if (board.name && viewable) {
        data.ogTitle = data.twTitle = config.website.title + ': ' + board.name;
      }

      // Description
      if (board.description && viewable) {
        data.ogDescription = data.twDescription = board.description;
      }

      return data;
    })
    .then(function(data) { return reply.view('index', data); })
    .catch(() => { return reply().redirect('/404'); });
  }
};
