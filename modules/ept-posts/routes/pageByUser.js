var Joi = require('joi');
var path = require('path');
var Promise = require('bluebird');
var querystring = require('querystring');
var common = require(path.normalize(__dirname + '/../common'));

/**
  * @apiVersion 0.4.0
  * @apiGroup Posts
  * @api {GET} /posts/user/:username Page By User
  * @apiName PagePostsByUser
  * @apiDescription Used to page through posts made by a particular user
  *
  * @apiParam {string} username The username of the user's whose posts to page through
  *
  * @apiParam (Query) {number} page=1 Which page of the user's posts to retrieve
  * @apiParam (Query) {number} limit=25 How many posts to return per page
  * @apiParam (Query) {boolean} desc=true True to sort descending, false to sort ascending
  *
  * @apiSuccess {array} posts Array containing posts for a particular user
  *
  * @apiError (Error 500) InternalServerError There was an issue finding posts for the user
  */
module.exports = {
  method: 'GET',
  path: '/api/posts/user/{username}',
  config: {
    auth: { mode: 'try', strategy: 'jwt' },
    validate: {
      params: { username: Joi.string().required() },
      query: {
        page: Joi.number().integer().min(1).default(1),
        limit: Joi.number().integer().min(1).max(100).default(25),
        desc: Joi.boolean().default(true)
      }
    },
    pre: [ { method: 'auth.posts.pageByUser(server, auth, params.username)', assign: 'auth' } ],
    handler: function(request, reply) {
      var userId = '';
      var authenticated = request.auth.isAuthenticated;
      if (authenticated) { userId = request.auth.credentials.id; }
      var viewables = request.pre.auth.viewables;
      var priority = request.pre.auth.priority;
      var username = querystring.unescape(request.params.username);
      var opts = {
        limit: request.query.limit,
        page: request.query.page,
        sortDesc: request.query.desc
      };

      var getPosts = request.db.posts.pageByUser(username, priority, opts);
      var getCount = request.db.posts.pageByUserCount(username);

      // get user's posts
      var promise = Promise.join(getPosts, getCount, function(posts, count) {
        return {
          page: opts.page,
          limit: opts.limit,
          sortDesc: opts.sortDesc,
          posts: common.cleanPosts(posts, userId, viewables),
          count: count
        };
      });

      return reply(promise);
    }
  }
};
