var core = require('epochcore')();
var Hapi = require('hapi');
var Promise = require('bluebird');
var cheerio = require('cheerio');
var bbcodeParser = require('bbcode-parser');
var postValidator = require('epoch-validator').api.posts;
var path = require('path');
var sanitize = require(path.join('..', '..', 'sanitize'));

// Pre
var pre = {
  authPost: function(request, reply) {
    var userId = request.auth.credentials.id;
    var postId = request.params.id;

    core.posts.find(postId)
    .then(function(post) {
      var authError;

      if (post.user_id !== userId) {
        authError = Hapi.error.badRequest('User did not create this post.');
      }

      return reply(authError);
    })
    .catch(function() {
      var error = Hapi.error.badRequest('Post Not Found');
      return reply(error);
    });
  },
  clean: function(request, reply) {
    request.payload.title = sanitize.strip(request.payload.title);
    request.payload.encodedBody = sanitize.bbcode(request.payload.encodedBody);
    return reply();
  },
  parseEncodings: function(request, reply) {
    // check if encodedBody has any bbcode
    if (request.payload.encodedBody.indexOf('[') >= 0) {
      // convert all &lt; and &gt; to decimal to escape the regex
      // in the bbcode parser that'll unescape those chars
      request.payload.encodedBody = request.payload.encodedBody.replace(/&gt;/g, '&#62;');
      request.payload.encodedBody = request.payload.encodedBody.replace(/&lt;/g, '&#60;');

      // parse encodedBody to generate body
      var parsedBody = bbcodeParser.process({text: request.payload.encodedBody}).html;
      request.payload.body = parsedBody;

      // check if parsing was needed
      if (parsedBody === request.payload.encodedBody) {
        // it wasn't need so remove encodedBody
        request.payload.encodedBody = null;
      }
    }
    else {
      // nothing to parse, just move encodedBody to body
      request.payload.body = request.payload.encodedBody;
      request.payload.encodedBody = null;
    }

    return reply();
  },
  subImages: function(request, reply) {
    // load html in post.body into cheerio
    var html = request.payload.body;
    var $ = cheerio.load(html);

    // collect all the images in the body
    var images = [];
    $('img').each(function(index, element) {
      images.push(element);
    });

    // convert each image's src to cdn version
    return Promise.map(images, function(element) {
      // get image src
      var src = $(element).attr('src');

      // if image already in cdn, skip
      if (config.cdnUrl && src.indexOf(config.cdnUrl) === 0) { return; }

      // get new url from cdn
      var cdnUrl = cdn.url(src);

      if (src !== cdnUrl) {
        // move original src to data-canonical-src
        $(element).attr('data-canonical-src', src);
      }

      // update src with new url
      $(element).attr('src', cdnUrl);
    })
    .then(function() {
      request.payload.body = $.html();
      return reply();
    })
    .catch(function(err) { return reply(err); });
  }
};

// Route handlers/configs
var posts = {};
posts.create = {
  auth: { strategy: 'jwt' },
  validate: { payload: postValidator.schema.create },
  pre: [
    { method: pre.clean },
    { method: pre.parseEncodings },
    { method: pre.subImages }
  ],
  handler: function(request, reply) {
    // build the post object from payload and params
    var user = request.auth.credentials;
    var newPost = {
      title: request.payload.title,
      body: request.payload.body,
      encodedBody: request.payload.encodedBody,
      thread_id: request.payload.thread_id,
      user_id: user.id
    };

    // create the post in core
    core.posts.create(newPost)
    .then(function(post) { reply(post); })
    .catch(function() { reply(Hapi.error.internal()); });
  }
};

posts.import = {
  // auth: { strategy: 'jwt' },
  // pre: [
  //   { method: pre.clean },
  //   { method: pre.parseEncodings },
  //   { method: pre.subImages }
  // ],
  // validate: { payload: postValidator.create },
  handler: function(request, reply) {
    // build the post object from payload and params
    core.posts.import(request.payload)
    .then(function(post) { reply(post); })
    .catch(function(err) { reply(err); });
  }
};

posts.find = {
  validate: { params: postValidator.schema.id },
  handler: function(request, reply) {
    var id = request.params.id;
    core.posts.find(id)
    .then(function(post) { reply(post); })
    .catch(function() { reply(Hapi.error.internal()); });
  }
};

posts.byThread = {
  auth: { mode: 'try', strategy: 'jwt' },
  validate: {
    params: postValidator.paramsByThread,
    query: postValidator.queryByThread
  },
  handler: function(request, reply) {
    var user;
    if (request.auth.isAuthenticated) { user = request.auth.credentials; }
    var threadId = request.query.thread_id || request.params.thread_id;
    var opts = {
      limit: request.query.limit || request.params.limit,
      page: request.query.page || request.params.page
    };

    core.posts.byThread(threadId, opts)
    .then(function(posts) {
      if (user) {
        posts.map(function(post) {
          if (post.user.id === user.id) { post.editable = true; }
        });
      }

      reply(posts);
    })
    .catch(function() { reply(Hapi.error.internal()); });
  }
};

posts.update = {
  auth: { strategy: 'jwt' },
  validate: {
    payload: postValidator.schema.update,
    params: postValidator.schema.id
  },
  pre: [
    { method: pre.authPost },
    { method: pre.clean },
    { method: pre.parseEncodings },
    { method: pre.subImages }
  ],
  handler: function(request, reply) {
    // build updatePost object from params and payload
    var updatePost = {
      id: request.params.id,
      title: request.payload.title,
      body: request.payload.body,
      encodedBody: request.payload.encodedBody,
      thread_id: request.payload.thread_id
    };

    core.posts.update(updatePost)
    .then(function(post) { reply(post); })
    .catch(function() { reply(Hapi.error.internal()); });
  }
};

posts.delete = {
  auth: { strategy: 'jwt' },
  validate: { params: postValidator.schema.id },
  pre: [ { method: pre.authPost } ],
  handler: function(request, reply) {
    var postId = request.params.id;
    core.posts.delete(postId)
    .then(function(post) { reply(post); })
    .catch(function() { reply(Hapi.error.internal()); });
  },
};

// Export Routes/Pre
exports.routes = [
  // CREATE NEW POST UNDER A THREAD
  { method: 'POST', path: '/posts', config: posts.create },
  // GET A SINGLE POST
  { method: 'GET', path: '/posts/{id}', config: posts.find },
  // QUERY for posts under: thread_id
  { method: 'GET', path: '/posts', config: posts.byThread },
  // UPDATE POST
  { method: 'POST', path: '/posts/{id}', config: posts.update },
  // DELETE POST
  { method: 'DELETE', path: '/posts/{id}', config: posts.delete },
  // IMPORT POST
  { method: 'POST', path: '/posts/import', config: posts.import }
];

exports.pre = pre;
