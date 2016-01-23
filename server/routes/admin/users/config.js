var Joi = require('joi');
var _ = require('lodash');
var path = require('path');
var Boom = require('boom');
var querystring = require('querystring');
var common = require(path.normalize(__dirname + '/../../../common'));
var authHelper = require(path.normalize(__dirname + '/../../auth/helper'));
var authorization = require(path.normalize(__dirname + '/../../../authorization'));

/**
  * @apiVersion 0.4.0
  * @apiGroup Users
  * @api {PUT} /admin/users (Admin) Update
  * @apiName UpdateUserAdmin
  * @apiPermission Super Administrator, Administrator, Global Moderator, Moderator
  * @apiDescription Used to update user information such as profile fields, or passwords. Allows admins and mods to update user's account if neccessary.
  *
  * @apiParam (Payload) {string} id The user's unique id
  * @apiParam (Payload) {string} [username] The user's username
  * @apiParam (Payload) {string} [email] The user's email
  * @apiParam (Payload) {string} [password] The user's new passowrd (used for changing password)
  * @apiParam (Payload) {string} [confirmation] The user's new password confirmation (used for changing password)
  * @apiParam (Payload) {string} [name] The user's name
  * @apiParam (Payload) {string} [website] URL to user's website
  * @apiParam (Payload) {string} [btcAddress] User's bitcoin wallet address
  * @apiParam (Payload) {string} [gender] The user's gender
  * @apiParam (Payload) {date} [dob] Date version of the user's dob
  * @apiParam (Payload) {string} [location] The user's geographical location
  * @apiParam (Payload) {string} [language] The user's native language
  * @apiParam (Payload) {string} [position] The user's position title
  * @apiParam (Payload) {string} [raw_signature] The user's signature as it was entered in the editor by the user
  * @apiParam (Payload) {string} [signature] The user's signature with any markup tags converted and parsed into html elements
  * @apiParam (Payload) {string} [avatar] URL to the user's avatar
  *
  * @apiSuccess {string} id The user's unique id
  * @apiSuccess {string} [username] The user's username
  * @apiSuccess {string} [email] The user's email
  * @apiSuccess {string} [name] The user's name
  * @apiSuccess {string} [website] URL to user's website
  * @apiSuccess {string} [btcAddress] User's bitcoin wallet address
  * @apiSuccess {string} [gender] The user's gender
  * @apiSuccess {timestamp} [dob] Timestamp of the user's dob
  * @apiSuccess {string} [location] The user's geographical location
  * @apiSuccess {string} [language] The user's native language
  * @apiSuccess {string} [position] The user's position title
  * @apiSuccess {string} [raw_signature] The user's signature as it was entered in the editor by the user
  * @apiSuccess {string} [signature] The user's signature with any markup tags converted and parsed into html elements
  * @apiSuccess {string} [avatar] URL to the user's avatar
  *
  * @apiError (Error 500) InternalServerError There was error updating the user
  */
exports.update = {
  app: {
    user_id: 'payload.id',
    privilege: 'adminUsers.privilegedUpdate'
  },
  auth: { strategy: 'jwt' },
  plugins: { acls: 'adminUsers.update' },
  validate: {
    payload: Joi.object().keys({
      id: Joi.string().required(),
      email: Joi.string().email(),
      username: Joi.string().regex(/^[a-zA-Z\d-_.]+$/).min(3).max(255).required(),
      password: Joi.string().min(8).max(72),
      name: Joi.string().allow(''),
      website: Joi.string().allow(''),
      btcAddress: Joi.string().allow(''),
      gender: Joi.string().allow(''),
      dob: Joi.date().allow(''),
      location: Joi.string().allow(''),
      language: Joi.string().allow(''),
      position: Joi.string().allow(''),
      raw_signature: Joi.string().allow(''),
      signature: Joi.string().allow(''),
      avatar: Joi.string().allow('')
    })
    .with('signature', 'raw_signature')
  },
  pre: [
    [
      // TODO: password should be needed to change email
      // TODO: password should be not updated by an admin role
      { method: authorization.matchPriority },
      { method: authorization.isNewUsernameUniqueAdmin },
      { method: authorization.isNewEmailUniqueAdmin }
    ],
    { method: common.cleanUser },
    { method: common.parseSignature },
    { method: common.handleSignatureImages }
  ],
  handler: function(request, reply) {
    var promise = request.db.users.update(request.payload)
    .then(function(user) {
      delete user.confirmation_token;
      delete user.reset_token;
      delete user.reset_expiration;
      delete user.password;
      return user;
    })
    .then(function(user) {
      return authHelper.updateUserInfo(user)
      .then(function() { return user; });
    });
    return reply(promise);
  }
};

/**
  * @apiVersion 0.4.0
  * @apiGroup Users
  * @api {GET} /admin/users/:username (Admin) Find
  * @apiName FindUserAdmin
  * @apiPermission Super Administrator, Administrator, Global Moderator, Moderator
  * @apiDescription Find a user by their username. (Includes user's email)
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
  * @apiSuccess {string} email The user's email address
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
exports.find = {
  auth: { strategy: 'jwt' },
  plugins: { acls: 'adminUsers.find' },
  validate: { params: { username: Joi.string().required() } },
  handler: function(request, reply) {
    var username = querystring.unescape(request.params.username);
    var promise = request.db.users.userByUsername(username)
    .then(function(user) {
      if (!user) { return Boom.notFound(); }
      delete user.passhash;
      delete user.confirmation_token;
      delete user.reset_token;
      user.priority = _.min(user.roles.map(function(role) { return role.priority; }));
      user.roles = user.roles.map(function(role) { return role.lookup; });
      return user;
    });
    return reply(promise);
  }
};

/**
  * @apiVersion 0.4.0
  * @apiGroup Users
  * @api {PUT} /admin/users/roles/add (Admin) Add Roles
  * @apiName AddUserRoleAdmin
  * @apiPermission Super Administrator, Administrator
  * @apiDescription Used to add a role or roles to a user. This allows Administrators to add new
  * (Super) Administrators and (Global) Moderators.
  *
  * @apiParam (Payload) {string[]} usernames A unique array of usernames to grant the role to
  * @apiParam (Payload) {string} role_id The unique id of the role to grant the user
  *
  * @apiSuccess {object[]} users An array containing the users with added roles
  * @apiSuccess {string} users.id The user's unique id
  * @apiSuccess {string} users.username The user's username
  * @apiSuccess {string} users.email The user's email address
  * @apiSuccess {timestamp} users.created_at Timestamp of when the user's account was created
  * @apiSuccess {timestamp} users.updated_at Timestamp of when the user's account was last updated
  * @apiSuccess {object[]} users.roles An array containing the users role objects
  * @apiSuccess {string} users.roles.id The unique id of the role
  * @apiSuccess {string} users.roles.name The name of the role
  * @apiSuccess {string} users.roles.description The description of the role
  * @apiSuccess {object} users.roles.permissions The permissions that this role has
  * @apiSuccess {timestamp} users.roles.created_at Timestamp of when the role was created
  * @apiSuccess {timestamp} users.roles.updated_at Timestamp of when the role was last updated
  *
  * @apiError (Error 500) InternalServerError There was error adding roles to the user
  */
exports.addRoles = {
  auth: { strategy: 'jwt' },
  plugins: { acls: 'adminUsers.addRoles' },
  validate: {
    payload: {
      usernames: Joi.array().items(Joi.string().required()).unique().min(1).required(),
      role_id: Joi.string().required()
    }
  },
  pre: [
    { method: authorization.hasAccessToRole },
    { method: authorization.hasSufficientPriorityToAddRole }
  ],
  handler: function(request, reply) {
    var usernames = request.payload.usernames;
    var roleId = request.payload.role_id;
    var promise = request.db.users.addRoles(usernames, roleId)
    .map(function(user) {
      return authHelper.updateRoles(user.id, user.roles)
      .then(function() { return user; });
    });
    return reply(promise);
  }
};

/**
  * @apiVersion 0.4.0
  * @apiGroup Users
  * @api {PUT} /admin/users/roles/remove (Admin) Remove Roles
  * @apiName RemoveUserRoleAdmin
  * @apiPermission Super Administrator, Administrator
  * @apiDescription Used to remove a role or roles to a user. This allows Administrators to remove
  * roles from an account.
  *
  * @apiParam (Payload) {string} user_id The unique id of the user to remove the role from
  * @apiParam (Payload) {string} role_id The unique id of the role to remove from the user
  *
  * @apiSuccess {string} id The user's unique id
  * @apiSuccess {string} username The user's username
  * @apiSuccess {string} email The user's email address
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
  * @apiError (Error 500) InternalServerError There was error removing roles from the user
  */
exports.removeRoles = {
  auth: { strategy: 'jwt' },
  plugins: { acls: 'adminUsers.removeRoles' },
  validate: {
    payload: {
      user_id: Joi.string().required(),
      role_id: Joi.string().required()
    }
  },
  pre: [ { method: authorization.hasSufficientPriorityToRemoveRole }, ],
  handler: function(request, reply) {
    var userId = request.payload.user_id;
    var roleId = request.payload.role_id;
    var promise = request.db.users.removeRoles(userId, roleId)
    .then(function(user) {
      return authHelper.updateRoles(user.id, user.roles)
      .then(function() { return user; });
    });
    return reply(promise);
  }
};

/**
  * @apiVersion 0.4.0
  * @apiGroup Users
  * @api {GET} /admin/users/search (Admin) Search Usernames
  * @apiName SearchUsernamesAdmin
  * @apiPermission Super Administrator, Administrator
  * @apiDescription This allows Administrators to search usernames. This is used in the admin panel
  * to autocomplete usernames when trying to quickly find a user.
  *
  * @apiParam (Query) {string} username Username to search for, doesn't have to be a full username
  * @apiParam (Query) {number} [limit=15] The number of usernames to return while searching
  *
  * @apiSuccess {string[]} usernames An array containing usernames with accounts on the forum
  * @apiSuccess {string} usernames.username Unique username of a user
  *
  * @apiError (Error 500) InternalServerError There was error searching for usernames
  */
exports.searchUsernames = {
  auth: { strategy: 'jwt' },
  plugins: { acls: 'adminUsers.searchUsernames' },
  validate: {
    query: {
      username: Joi.string().required(),
      limit: Joi.number().integer().min(1).max(100).default(15)
    }
  },
  handler: function(request, reply) {
    // get user by username
    var searchStr = request.query.username;
    var limit = request.query.limit;
    var promise = request.db.users.searchUsernames(searchStr, limit);
    return reply(promise);
  }
};

/**
  * @apiVersion 0.4.0
  * @apiGroup Users
  * @api {GET} /admin/users/count (Admin) Count Users
  * @apiName CountUsersAdmin
  * @apiPermission Super Administrator, Administrator
  * @apiDescription This allows Administrators to get a count of how many users are registered.
  * This is used in the admin panel for paginating through users.
  *
  * @apiParam (Query) {string="banned"} [filter] If banned is passed in, route will return count
  * of banned users.
  * @apiParam (Query) {string} [search] Used to filter count by search string
  *
  * @apiSuccess {number} count The number of users registered given the passed in parameters
  *
  * @apiError (Error 500) InternalServerError There was error calculating the user count
  */
exports.count = {
  auth: { strategy: 'jwt' },
  plugins: { acls: 'adminUsers.count' },
  validate: {
    query: {
      filter: Joi.string().valid('banned'),
      search: Joi.string()
    }
  },
  handler: function(request, reply) {
    var opts;
    var filter = request.query.filter;
    var search = request.query.search;
    if (filter || search) {
      opts = {
        filter: filter,
        searchStr: search
      };
    }

    var promise = request.db.users.count(opts);
    return reply(promise);
  }
};

/**
  * @apiVersion 0.4.0
  * @apiGroup Users
  * @api {GET} /admin/users (Admin) Page Users
  * @apiName PageUsersAdmin
  * @apiPermission Super Administrator, Administrator
  * @apiDescription This allows Administrators to page through all registered users.
  *
  * @apiParam (Query) {number{1..n}} [page=1] The page of registered users to retrieve
  * @apiParam (Query) {number{1..n}} [limit=25] The number of users to retrieve per page
  * @apiParam (Query) {string="username","email","updated_at","created_at","imported_at","ban_expiration"} [field=username] The db field to sort the results by
  * @apiParam (Query) {boolean} [desc=false] Boolean indicating whether or not to sort the results
  * in descending order
  * @apiParam (Query) {string="banned"} [filter] If banned is passed in only banned users are returned
  * @apiParam (Query) {string} [search] Username to search for
  *
  * @apiSuccess {object[]} users An array of user objects
  * @apiSuccess {string} users.id The unique id of the user
  * @apiSuccess {string} users.username The username of the user
  * @apiSuccess {string} users.email The email of the user
  * @apiSuccess {timestamp} users.ban_expiration Timestamp of when the user's ban expires
  * @apiSuccess {timestamp} users.created_at Timestamp of when the user was created
  * @apiSuccess {timestamp} users.updated_at Timestamp of when the user was last updated
  *
  * @apiError (Error 500) InternalServerError There was error retrieving the users
  */
exports.page = {
  auth: { strategy: 'jwt' },
  plugins: { acls: 'adminUsers.page' },
  validate: {
    query: {
      page: Joi.number().integer().min(1).default(1),
      limit: Joi.number().integer().min(1).max(100).default(25),
      field: Joi.string().default('username').valid('username', 'email', 'updated_at', 'created_at', 'imported_at', 'ban_expiration'),
      desc: Joi.boolean().default(false),
      filter: Joi.string().valid('banned'),
      search: Joi.string()
    }
  },
  handler: function(request, reply) {
    var opts = {
      limit: request.query.limit,
      page: request.query.page,
      sortField: request.query.field,
      sortDesc: request.query.desc,
      filter: request.query.filter,
      searchStr: request.query.search
    };
    var promise = request.db.users.page(opts);
    return reply(promise);
  }
};

/**
  * @apiVersion 0.4.0
  * @apiGroup Users
  * @api {PUT} /admin/users/ban (Admin) Ban
  * @apiName BanUsersAdmin
  * @apiPermission Super Administrator, Administrator, Global Moderator, Moderator
  * @apiDescription This allows Administrators and Moderators to ban users.
  *
  * @apiParam (Payload) {string} user_id The unique id of the user to ban
  * @apiParam (Payload) {date} expiration The expiration date for the ban, when not defined ban is
  * considered permanent
  *
  * @apiSuccess {string} id The unique id of the row in users.bans
  * @apiSuccess {string} user_id The unique id of the user being banned
  * @apiSuccess {timestamp} expiration Timestamp of when the user's ban expires
  * @apiSuccess {timestamp} created_at Timestamp of when the ban was created
  * @apiSuccess {timestamp} updated_at Timestamp of when the ban was last updated
  *
  * @apiError (Error 500) InternalServerError There was error banning the user
  */
exports.ban = {
  app: {
    user_id: 'payload.user_id',
    privilege: 'adminUsers.privilegedBan'
  },
  auth: { strategy: 'jwt' },
  plugins: { acls: 'adminUsers.ban' },
  validate: {
    payload: {
      user_id: Joi.string().required(),
      expiration: Joi.date()
    }
  },
  pre: [ { method: authorization.matchPriority } ],
  handler: function(request, reply) {
    var userId = request.payload.user_id;
    var expiration = request.payload.expiration || null;
    var promise = request.db.users.ban(userId, expiration)
    .then(function(user) {
      return authHelper.updateRoles(user.user_id, user.roles)
      .then(function() { return user; });
    });
    return reply(promise);
  }
};

/**
  * @apiVersion 0.4.0
  * @apiGroup Users
  * @api {PUT} /admin/users/unban (Admin) Unban
  * @apiName UnbanUsersAdmin
  * @apiPermission Super Administrator, Administrator, Global Moderator, Moderator
  * @apiDescription This allows Administrators and Moderators to unban users. Ban expiration
  * is set to current timestamp, expiring it immediately
  *
  * @apiParam (Payload) {string} user_id The unique id of the user to unban
  *
  * @apiSuccess {string} id The unique id of the row in users.bans
  * @apiSuccess {string} user_id The unique id of the user being unbanned
  * @apiSuccess {timestamp} expiration Timestamp of when the user's ban expires (current timestamp)
  * @apiSuccess {timestamp} created_at Timestamp of when the ban was created
  * @apiSuccess {timestamp} updated_at Timestamp of when the ban was last updated
  *
  * @apiError (Error 500) InternalServerError There was error unbanning the user
  */
exports.unban = {
  app: {
    user_id: 'payload.user_id',
    privilege: 'adminUsers.privilegedBan'
  },
  auth: { strategy: 'jwt' },
  plugins: { acls: 'adminUsers.unban' },
  validate: { payload: { user_id: Joi.string().required() } },
  pre: [ { method: authorization.matchPriority } ],
  handler: function(request, reply) {
    var userId = request.payload.user_id;
    var promise = request.db.users.unban(userId)
    .then(function(user) {
      return authHelper.updateRoles(user.user_id, user.roles)
      .then(function() { return user; });
    });
    return reply(promise);
  }
};
