var path = require('path');

exports.endpoints = function(internalConfig) {
  return [
    // static assets
    {
      method: 'GET',
      path: '/static/{path*}',
      handler: {
        directory: {
          path: path.join(__dirname, '..', '..', 'public')
        }
      }
    },
    // favicon
    {
      method: 'GET',
      path: '/favicon.ico',
      handler: function(request, reply) {
        var config = request.server.app.config;
        var iconPath = config.website.favicon;
        if (!iconPath) { iconPath = path.join(__dirname, '../../public/favicon.ico'); }
        return reply.file(iconPath);
      }
    },
    // index page
    {
      method: 'GET',
      path: '/{path*}',
      handler: function(request, reply) {
        var config = request.server.app.config;
        var data = {
          title: config.website.title,
          description: config.website.description,
          keywords: config.website.keywords,
          logo: config.website.logo,
          default_avatar: config.website.defaultAvatar,
          default_avatar_shape: config.website.defaultAvatarShape,
          favicon: config.website.favicon,
          websocket_host: config.websocket_client_host,
          websocket_port: config.websocket_port,
          post_max_length: config.postMaxLength,
          max_image_size: internalConfig.images.maxSize,
          portal: { enabled: config.portal.enabled },
          GAKey: config.gaKey,
          currentYear: new Date().getFullYear()
        };
        return reply.view('index', data);
      }
    }
  ];
};
