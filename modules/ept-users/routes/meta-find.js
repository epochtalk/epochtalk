var Joi = require('@hapi/joi');
var cheerio = require('cheerio');
var querystring = require('querystring');

module.exports = {
  method: 'GET',
  path: '/profiles/{username}',
  options: {
    auth: { mode: 'try', strategy: 'jwt' },
    validate: { params: { username: Joi.string().required() } },
    pre: [ { method: (request) => request.server.methods.auth.users.metaFind(request.server, request.auth, request.params), assign: 'viewable' } ]
  },
  handler: function(request, h) {
    var viewable = request.pre.viewable;
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

    // get user by username
    var username = querystring.unescape(request.params.username);
    return request.db.users.userByUsername(username)
    .then(function(user) {
      if (!user) { throw new Error('User Not Found'); }
      else { return user; }
    })
    .then(function(user) {
      // title
      if (viewable) {
        data.ogTitle = data.twTitle = user.username;
      }

      // description
      var $ = cheerio.load('<div ng-non-bindable>' + user.signature + '</div>');
      var description = $('div').text();
      description = description.replace(/{/g, '&#123;').replace(/}/g, '&#125;');
      if (description && viewable) {
        data.ogDescription = data.twDescription = description;
      }

      // Data fields
      if (viewable) {
        data.twLabel1 = 'Number of Posts: ';
        data.twData1 = user.post_count;

        data.twLabel2 = 'Account Created: ';
        data.twData2 = user.created_at;
      }

      // Image
      if (viewable) {
        data.twImage = user.avatar;
        data.ogImages = [user.avatar];
      }

      return data;
    })
    .then(function(data) { return h.view('index', data); })
    .catch(function() { return h.redirect('/404'); });
  }
};
