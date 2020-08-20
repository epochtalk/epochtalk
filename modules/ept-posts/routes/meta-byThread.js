var Joi = require('@hapi/joi');
var Promise = require('bluebird');
var cheerio = require('cheerio');

module.exports = {
  method: 'GET',
  path: '/threads/{slug}/posts',
  options: {
    app: { hook: 'posts.byThread' },
    auth: { mode: 'try', strategy: 'jwt' },
    validate: { params: Joi.object({ slug: Joi.string().regex(/^[a-zA-Z0-9-~!@)(_+:'"\.](-?[a-zA-Z0-9-~!@)(_+:'"\.])*$/).min(1).max(100).required() }) },
    pre: [
      { method: (request) => request.server.methods.auth.posts.metaByThread(request.server, request.auth, request.params.slug), assign: 'viewable' },
    ]
  },
  handler: function(request, h) {
    var slug = request.params.slug;
    var viewable = request.pre.viewable;
    var config = request.server.app.config;
    var data = {
      title: config.website.title,
      description: config.website.description,
      keywords: config.website.keywords,
      logo: config.website.logo,
      favicon: config.website.favicon,
      default_avatar: config.website.defaultAvatar,
      default_avatar_shape: config.website.defaultAvatarShape,
      websocket_host: config.websocket_client_host,
      websocket_port: config.websocket_port,
      post_max_length: config.postMaxLength,
      max_image_size: config.images.maxSize,
      portal: { enabled: config.portal.enabled },
      GAKey: config.gaKey,
      currentYear: new Date().getFullYear()
    };

    // retrieve posts for this thread
    var getFirstPost = request.db.threads.getThreadFirstPost(null, slug);
    var getThread = request.db.threads.find(null, slug);

    return Promise.join(getThread, getFirstPost, function(thread, post) {

      // Title
      if (thread.title && viewable) {
        data.ogTitle = data.twTitle = config.website.title + ': ' + thread.title;
      }

      // Description
      var $ = cheerio.load('<div>' + post.body + '</div>');
      var postBody = $('div').text();
      if (postBody && viewable) {
        data.ogDescription = data.twDescription = postBody;
      }

      // Data Fields
      if (viewable) {
        data.twLabel1 = 'Post Count:';
        data.twData1 = thread.post_count + ' Post(s)';

        data.twLabel2 = 'Created By:';
        data.twData2 = post.username;
      }

      // Images
      var imageUrls = [];
      $('img').each((index, element) => { imageUrls.push($(element).attr('src')); });
      if (viewable && imageUrls.length > 0) {
        data.twImage = imageUrls[0];
        data.ogImages = imageUrls;
      }

      return data;
    })
    .then(function(data) { return h.view('index', data); })
    .catch(() => { return h.redirect('/404'); });
  }
};
