var Joi = require('joi');
var cheerio = require('cheerio');
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
  path: '/profiles/{username}',
  config: {
    auth: { mode: 'try', strategy: 'jwt' },
    validate: { params: { username: Joi.string().required() } },
    pre: [ { method: 'auth.users.metaFind(server, auth, params)', assign: 'viewable' } ]
  },
  handler: function(request, reply) {
    var viewable = request.pre.viewable;
    var config = request.server.app.config;
    var data = {
      title: config.website.title,
      description: config.website.description,
      keywords: config.website.keywords,
      logo: config.website.logo,
      favicon: config.website.favicon,
      websocket_host: config.websocket_client_host,
      websocket_port: config.websocket_port,
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
      var $ = cheerio.load('<div>' + user.signature + '</div>');
      var description = $('div').text();
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
    .then(function(data) { return reply.view('index', data); })
    .catch(function() { return reply().redirect('/404'); });
  }
};
