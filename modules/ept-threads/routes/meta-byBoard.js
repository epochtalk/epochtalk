var Joi = require('@hapi/joi');

module.exports = {
  method: 'GET',
  path: '/boards/{slug}',
  options: {
    app: { hook: 'threads.byBoard' },
    auth: { mode: 'try', strategy: 'jwt' },
    validate: { params: Joi.object({ slug: Joi.string().required() }) },
    pre: [
      { method: (request) => request.server.methods.auth.threads.metaByBoard(request.server, request.auth, request.params.slug), assign: 'viewable' }
    ],
  },
  handler: function(request, h) {
    var userPriority = request.server.plugins.acls.getUserPriority(request.auth);
    var viewable = request.pre.viewable;
    var slug = request.params.slug;
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
      google_api_key: config.googleAPIKey,
      google_client_id: config.googleClientId,
      google_app_domain: config.googleAppDomain,
      currentYear: new Date().getFullYear()
    };

    return request.db.boards.find(null, userPriority, slug)
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
    .then(function(data) { return h.view('index', data); })
    .catch(() => { return h.redirect('/404'); });
  }
};
