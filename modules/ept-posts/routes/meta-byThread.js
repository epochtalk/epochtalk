var Joi = require('joi');
var Promise = require('bluebird');
var cheerio = require('cheerio');

module.exports = {
  method: 'GET',
  path: '/threads/{thread_id}/posts',
  options: {
    app: { hook: 'posts.byThread' },
    auth: { mode: 'try', strategy: 'jwt' },
    validate: { params: { thread_id: Joi.string().required() } },
    pre: [
      { method: (request) => request.server.methods.auth.posts.metaByThread(request.server, request.auth, request.params.thread_id), assign: 'viewable' },
    ]
  },
  handler: function(request, h) {
    var threadId = request.params.thread_id;
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

    // retrieve posts for this thread
    var getFirstPost = request.db.posts.byThread(threadId, { start: 0, limit: 1 });
    var getThread = request.db.threads.find(threadId);

    return Promise.join(getThread, getFirstPost, function(thread, post) {

      // Title
      if (thread.title && viewable) {
        data.ogTitle = data.twTitle = config.website.title + ': ' + thread.title;
      }

      // Description
      var $ = cheerio.load('<div>' + post[0].body + '</div>');
      var postBody = $('div').text();
      if (postBody && viewable) {
        data.ogDescription = data.twDescription = postBody;
      }

      // Data Fields
      if (viewable) {
        data.twLabel1 = 'Post Count:';
        data.twData1 = thread.post_count + ' Post(s)';

        data.twLabel2 = 'Created By:';
        data.twData2 = post[0].user.username;
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
