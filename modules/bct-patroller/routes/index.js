var Joi = require('joi');
var path = require('path');
var Boom = require('boom');
var db = require(path.normalize(__dirname + '/../db'));
var common = require(path.normalize(__dirname + '/../common'));

// route
var route = {
  method: 'GET',
  path: '/api/patrol',
  config: {
    auth: { strategy: 'jwt' },
    validate: {
      query: Joi.object().keys({
        page: Joi.number().integer().min(1),
        limit: Joi.number().integer().min(1).max(100).default(25)
      }).without('start', 'page')
    },
    pre: [ { method: isPatroller } ]
  },
  handler: function(request, reply) {
    // ready parameters
    var userId = request.auth.credentials.id;
    var opts = {
      page: request.query.page,
      limit: request.query.limit + 1 // check if there are more posts
    };

    // retrieve posts for this thread
    var promise = db.posts(request.db, opts)
    .then(function(posts) {

      // hasMoreCheck
      var hasMorePosts = false;
      if (posts.length > request.query.limit) {
        hasMorePosts = true;
        posts.pop();
      }

      return {
        limit: request.query.limit,
        page: request.query.page,
        hasMorePosts: hasMorePosts,
        posts: common.clean(posts, userId, true)
      };
    });

    return reply(promise);
  }
};

function isPatroller (request, reply) {
  var hasRole = false;
  request.auth.credentials.roles.map(function(role) {
    if (role === 'patroller') { hasRole = true; }
  });

  var retVal;
  if (!hasRole) { retVal = Boom.forbidden(); }
  return reply(retVal);
}

module.exports = [route];
