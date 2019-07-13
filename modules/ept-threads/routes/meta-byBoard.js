var Joi = require('joi');

module.exports = {
  method: 'GET',
  path: '/boards/{board_id}',
  config: {
    app: { hook: 'threads.byBoard' },
    auth: { mode: 'try', strategy: 'jwt' },
    validate: { params: { board_id: Joi.string().required() } },
    pre: [
      { method: 'auth.threads.metaByBoard(request.server, auth, params.board_id)', assign: 'viewable' }
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
      default_avatar: config.website.defaultAvatar,
      websocket_host: config.websocket_client_host,
      websocket_port: config.websocket_port,
      post_max_length: config.postMaxLength,
      max_image_size: config.images.maxSize,
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
