var Joi = require('joi');
var Promise = require('bluebird');

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
  plugins: {
    acls: 'adminUsers.addRoles',
    mod_log: {
      type: 'adminUsers.addRoles',
      data: {
        usernames: 'payload.usernames',
        role_id: 'payload.role_id'
      }
    }
  },
  validate: {
    payload: {
      usernames: Joi.array().items(Joi.string().required()).unique().min(1).required(),
      role_id: Joi.string().required()
    }
  },
  pre: [ { method: 'auth.admin.users.addRole(server, auth, payload.role_id, payload.usernames)' } ],
  handler: function(request, reply) {
    var usernames = request.payload.usernames;
    var roleId = request.payload.role_id;
    var promise = request.db.roles.addRoles(usernames, roleId)
    .tap(function(users) {
      return Promise.map(users, function(user) {
        var notification = {
          channel: { type: 'user', id: user.id },
          data: { action: 'reauthenticate' }
        };
        request.server.plugins.notifications.systemNotification(notification);
      });
    })
    .tap(function(users) {
      return Promise.map(users, function(user) {
        return request.session.updateRoles(user.id, user.roles);
      });
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
  * @apiDescription Used to remove a role or roles from a user. This allows Administrators to remove
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
  plugins: {
    acls: 'adminUsers.removeRoles',
    mod_log: {
      type: 'adminUsers.removeRoles',
      data: {
        user_id: 'payload.user_id',
        role_id: 'payload.role_id'
      }
    }
  },
  validate: {
    payload: {
      user_id: Joi.string().required(),
      role_id: Joi.string().required()
    }
  },
  pre: [ { method: 'auth.admin.users.deleteRole(server, auth, payload.user_id)' } ],
  handler: function(request, reply) {
    var userId = request.payload.user_id;
    var roleId = request.payload.role_id;
    var promise = request.db.roles.removeRoles(userId, roleId)
    .tap(function(user) {
      var notification = {
        channel: { type: 'user', id: user.id },
        data: { action: 'reauthenticate' }
      };
      request.server.plugins.notifications.systemNotification(notification);
    })
    .then(function(user) {
      return request.session.updateRoles(user.id, user.roles)
      .then(function() {
        var roleNames = user.roles.map(function(role) { return role.lookup; });
        // If they had the banned role removed, update the users ban info in redis/session
        if (roleNames.indexOf('banned') > -1) { return request.session.updateBanInfo(user.id); }
        else { return; }
      })
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
      search: Joi.string(),
      ip: Joi.boolean()
    }
  },
  handler: function(request, reply) {
    var opts;
    var filter = request.query.filter;
    var search = request.query.search;
    var ip = request.query.ip;
    if (filter || search) {
      opts = {
        filter: filter,
        searchStr: search,
        ip: ip
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
      search: Joi.string(),
      ip: Joi.boolean()
    }
  },
  handler: function(request, reply) {
    var opts = {
      limit: request.query.limit,
      page: request.query.page,
      sortField: request.query.field,
      sortDesc: request.query.desc,
      filter: request.query.filter,
      searchStr: request.query.search,
      ip: request.query.ip
    };
    var promise = request.db.users.page(opts);
    return reply(promise);
  }
};
