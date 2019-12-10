var Joi = require('@hapi/joi');
var path = require('path');
var common = require(path.normalize(__dirname + '/../common'));

/**
  * @apiVersion 0.4.0
  * @apiGroup Posts
  * @api {GET} /posts/:id Find
  * @apiName FindPost
  * @apiDescription Used to find a post.
  *
  * @apiParam {string} id The unique id of the post to retrieve
  *
  * @apiUse PostObjectSuccess
  * @apiSuccess {string} avatar The avatar of the post author
  * @apiSuccess {number} position The position of the post within the thread
  * @apiSuccess {timestamp} updated_at The updated at timestamp of the post
  * @apiSuccess {timestamp} imported_at The imported at timestamp of the post
  * @apiSuccess {object} user Object containing user data about the author of the post
  * @apiSuccess {string} user.id The id of the user
  * @apiSuccess {string} user.name The name of the user
  * @apiSuccess {string} user.username The username of the user
  * @apiSuccess {string} user.signature The signature of the user
  *
  * @apiError (Error 500) InternalServerError There was an issue finding the post
  */
module.exports = {
  method: 'GET',
  path: '/api/posts/{id}',
  options: {
    app: { hook: 'posts.find' },
    auth: { mode: 'try', strategy: 'jwt' },
    validate: { params: Joi.object({ id: Joi.string().required() }) },
    pre: [
      { method: (request) => request.server.methods.auth.posts.find(request.server, request.auth, request.params.id), assign: 'viewDeleted' },
      { method: (request) => request.server.methods.hooks.preProcessing(request) },
      [
        { method: (request) => request.server.methods.hooks.parallelProcessing(request), assign: 'parallelProcessed' },
        { method: processing, assign: 'processed' },
      ],
      { method: (request) => request.server.methods.hooks.merge(request) },
      { method: (request) => request.server.methods.common.posts.parseOut(request.parser, request.pre.processed) },
      { method: (request) => request.server.methods.hooks.postProcessing(request) }
    ],
    handler: function(request) {
      return request.pre.processed;
    }
  }
};

function processing(request) {
  // retrieve post
  var userId = '';
  var authenticated = request.auth.isAuthenticated;
  if (authenticated) { userId = request.auth.credentials.id; }
  var viewDeleted = request.pre.viewDeleted;
  var id = request.params.id;
  var promise = request.db.posts.find(id)
  .then(function(post) { return common.cleanPosts(post, userId, viewDeleted, request); })
  .then(function(posts) { return posts[0]; })
  .error(request.errorMap.toHttpError);

  return promise;
}
