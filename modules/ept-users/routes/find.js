var Joi = require('joi');
var _ = require('lodash');
var Boom = require('boom');
var querystring = require('querystring');

/**
  * @apiVersion 0.4.0
  * @apiGroup Users
  * @api {GET} /users/:username Find
  * @apiName FindUser
  * @apiDescription Find a user by their username.
  *
  * @apiParam {string} username The username of the user to find
  *
  * @apiSuccess {string} id The user's unique id
  * @apiSuccess {string} username The user's username
  * @apiSuccess {string} avatar URL to the user's avatar image
  * @apiSuccess {string} signature The user's signature with any markup tags converted and parsed into html elements
  * @apiSuccess {string} raw_signature The user's signature as it was entered in the editor by the user
  * @apiSuccess {number} post_count The number of posts made by this user
  * @apiSuccess {string} name The user's actual name (e.g. John Doe)
  * @apiSuccess {string} website URL to the user's website
  * @apiSuccess {string} gender The user's gender
  * @apiSuccess {timestamp} dob The user's date of birth
  * @apiSuccess {string} location The user's location
  * @apiSuccess {string} language The user's native language (e.g. English)
  * @apiSuccess {timestamp} created_at Timestamp of when the user's account was created
  * @apiSuccess {timestamp} updated_at Timestamp of when the user's account was last updated
  * @apiSuccess {object[]} roles An array containing the users role objects
  * @apiSuccess {string} roles.id The unique id of the role
  * @apiSuccess {string} roles.name The name of the role
  * @apiSuccess {string} roles.description The description of the role
  * @apiSuccess {object} roles.permissions The permissions that this role has
  * @apiSuccess {timestamp} roles.created_at Timestamp of when the role was created
  * @apiSuccess {timestamp} roles.updated_at Timestamp of when the role was last updated
  *
  * @apiError BadRequest The user doesn't exist
  * @apiError (Error 500) InternalServerError There was error looking up the user
  */
module.exports = {
  method: 'GET',
  path: '/api/users/{username}',
  config: {
    app: { hook: 'users.find' },
    auth: { mode: 'try', strategy: 'jwt' },
    validate: { params: { username: Joi.string().required() } },
    pre: [
      { method: 'auth.users.find(server, auth, params)', assign: 'view' },
      { method: 'hooks.preProcessing' },
      [
        { method: 'hooks.parallelProcessing', assign: 'parallelProcessed' },
        { method: processing, assign: 'processed' },
      ],
      { method: 'hooks.merge' },
      { method: 'hooks.postProcessing' }
    ],
    handler: function(request, reply) {
      return reply(request.pre.processed);
    }
  }
};

function processing(request, reply) {
  // get logged in user id
  var userId = '';
  var authenticated = request.auth.isAuthenticated;
  if (authenticated) { userId = request.auth.credentials.id; }

  // get user by username
  var adminView = request.pre.view;
  var username = querystring.unescape(request.params.username);
  var promise = request.db.users.userByUsername(username)
  .then(function(user) {
    if (!user) { return Boom.notFound(); }
    delete user.passhash;
    delete user.confirmation_token;
    delete user.reset_token;
    delete user.reset_expiration;
    if (!adminView) {
      delete user.email;
      delete user.posts_per_page;
      delete user.thread_per_page;
      delete user.collapsed_categories;
    }
    else {
      user.posts_per_page = user.posts_per_page || 25;
      user.threads_per_page = user.threads_per_page || 25;
      user.collapsed_categories = user.collapsed_categories || [];
    }
    user.priority = _.min(user.roles.map(function(role) { return role.priority; }));
    user.roles = user.roles.map(function(role) { return role.lookup; });
    if (user.roles.length < 1) { user.roles.push('user'); }
    return user;
  })
  .error(request.errorMap.toHttpError);

  return reply(promise);
}
