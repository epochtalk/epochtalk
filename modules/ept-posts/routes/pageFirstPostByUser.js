var Joi = require('joi');
var path = require('path');
var Promise = require('bluebird');
var querystring = require('querystring');
var common = require(path.normalize(__dirname + '/../common'));


module.exports = {
  method: 'GET',
  path: '/api/posts/user/{username}/started',
  options: {
    auth: { mode: 'try', strategy: 'jwt' },
    validate: {
      params: { username: Joi.string().required() },
      query: {
        page: Joi.number().integer().min(1).default(1),
        limit: Joi.number().integer().min(1).max(100).default(25),
        desc: Joi.boolean().default(true)
      }
    },
    pre: [
      { method: (request) => request.server.methods.auth.posts.pageByUser(request.server, request.auth, request.params.username), assign: 'auth' },
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
  var userId = '';
  var authenticated = request.auth.isAuthenticated;
  if (authenticated) { userId = request.auth.credentials.id; }
  var viewables = request.pre.auth.viewables;
  var priority = request.pre.auth.priority;
  var username = querystring.unescape(request.params.username);
  var opts = {
    limit: request.query.limit,
    page: request.query.page,
    desc: request.query.desc
  };

  // get user's posts
  var promise = request.db.posts.pageFirstPostByUser(username, priority, opts)
  .then(function(posts) {
    return {
      page: opts.page,
      limit: opts.limit,
      desc: opts.desc,
      posts: common.cleanPosts(posts, userId, viewables, request)
    };
  })
  .error(request.errorMap.toHttpError);

  return promise;
}
