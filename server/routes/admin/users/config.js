var Joi = require('joi');

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
    .map(function(user) {
      return request.session.updateRoles(user.id, user.roles)
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
  plugins: {
    acls: 'adminUsers.ban',
    mod_log: {
      type: 'adminUsers.ban',
      data: {
        user_id: 'payload.user_id',
        expiration: 'payload.expiration'
      }
    }
  },
  validate: {
    payload: {
      user_id: Joi.string().required(),
      expiration: Joi.date()
    }
  },
  pre: [ { method: 'auth.admin.users.ban(server, auth, payload.user_id)' } ],
  handler: function(request, reply) {
    var userId = request.payload.user_id;
    var expiration = request.payload.expiration || null;
    var promise = request.db.bans.ban(userId, expiration)
    .then(function(user) {
      return request.session.updateRoles(user.user_id, user.roles)
      .then(function() { return request.session.updateBanInfo(user.user_id, user.expiration); })
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
  plugins: {
    acls: 'adminUsers.unban',
    mod_log: {
      type: 'adminUsers.unban',
      data: { user_id: 'payload.user_id' }
    }
  },
  validate: { payload: { user_id: Joi.string().required() } },
  pre: [ { method: 'auth.admin.users.ban(server, auth, payload.user_id)' } ],
  handler: function(request, reply) {
    var userId = request.payload.user_id;
    var promise = request.db.bans.unban(userId)
    .then(function(user) {
      return request.session.updateRoles(user.user_id, user.roles)
      .then(function() { return request.session.updateBanInfo(user.user_id); })
      .then(function() { return user; });
    });
    return reply(promise);
  }
};

/**
  * @apiVersion 0.4.0
  * @apiGroup Users
  * @api {PUT} /admin/users/ban/board (Admin) Ban From Boards
  * @apiName BanFromBoardsAdmin
  * @apiPermission Super Administrator, Administrator, Global Moderator, Moderator
  * @apiDescription This allows Administrators and Moderators to ban users from boards.
  *
  * @apiParam (Payload) {string} user_id The unique id of the user to ban from boards
  * @apiParam (Payload) {string[]} board_ids Array of board ids to ban the user from
  *
  * @apiSuccess {string} user_id The unique id of the user being banned from boards
  * @apiSuccess {string} board_ids Array of board ids to ban the user from
  *
  * @apiError (Error 500) InternalServerError There was error banning the user from Boards
  * @apiError (Error 403) Forbidden User tried to ban from a board they do not moderate, or tried
  * to ban a user with higher permissions than themselves
  */
exports.banFromBoards = {
  auth: { strategy: 'jwt' },
  plugins: {
    acls: 'adminUsers.banFromBoards',
    mod_log: {
      type: 'adminUsers.banFromBoards',
      data: {
        user_id: 'payload.user_id',
        board_ids: 'payload.board_ids'
      }
    }
  },
  validate: {
    payload: {
      user_id: Joi.string().required(),
      board_ids: Joi.array().items(Joi.string().required()).unique().min(1).required()
    }
  },
  pre: [ { method: 'auth.admin.users.banFromBoards(server, auth, payload.user_id, payload.board_ids)' } ],
  handler: function(request, reply) {
    var userId = request.payload.user_id;
    var boardIds = request.payload.board_ids;
    var promise = request.db.bans.banFromBoards(userId, boardIds);
    return reply(promise);
  }
};

/**
  * @apiVersion 0.4.0
  * @apiGroup Users
  * @api {PUT} /admin/users/unban/board (Admin) Unban From Boards
  * @apiName UnbanFromBoardsAdmin
  * @apiPermission Super Administrator, Administrator, Global Moderator, Moderator
  * @apiDescription This allows Administrators and Moderators to unban users from boards.
  *
  * @apiParam (Payload) {string} user_id The unique id of the user to unban from boards
  * @apiParam (Payload) {string[]} board_ids Array of board ids to unban the user from
  *
  * @apiSuccess {string} user_id The unique id of the user being unbanned from boards
  * @apiSuccess {string} board_ids Array of board ids to unban the user from
  *
  * @apiError (Error 500) InternalServerError There was error unbanning the user from Boards
  * @apiError (Error 403) Forbidden User tried to unban from a board they do not moderate, or tried
  * to unban a user with higher permissions than themselves
  */
exports.unbanFromBoards = {
  auth: { strategy: 'jwt' },
  plugins: {
    acls: 'adminUsers.unbanFromBoards',
    mod_log: {
      type: 'adminUsers.unbanFromBoards',
      data: {
        user_id: 'payload.user_id',
        board_ids: 'payload.board_ids'
      }
    }
  },
  validate: {
    payload: {
      user_id: Joi.string().required(),
      board_ids: Joi.array().items(Joi.string().required()).unique().min(1).required()
    }
  },
  pre: [ { method: 'auth.admin.users.banFromBoards(server, auth, payload.user_id, payload.board_ids)' } ],
  handler: function(request, reply) {
    var userId = request.payload.user_id;
    var boardIds = request.payload.board_ids;
    var promise = request.db.bans.unbanFromBoards(userId, boardIds);
    return reply(promise);
  }
};

/**
  * @apiVersion 0.4.0
  * @apiGroup Users
  * @api {GET} /users/:username/bannedboards (Admin) Get User's Banned Boards
  * @apiName GetBannedBoardsAdmin
  * @apiPermission Super Administrator, Administrator, Global Moderator, Moderator
  * @apiDescription This allows Administrators and Moderators to retrieve a list of boards
  * that a user has been banned from.
  *
  * @apiParam {string} username The username of the user to get banned boards for
  *
  * @apiSuccess {object[]} banned_boards An array of boards that the user is banned from
  * @apiSuccess {string} banned_boards.id The id of the board the user is banned from
  * @apiSuccess {string} banned_boards.name The name of the board the user is banned from
  *
  * @apiError (Error 500) InternalServerError There was error retrieving the user's banned boards
  * @apiError (Error 403) Forbidden User doesn't have permission to query for user's banned boards
  */
exports.getBannedBoards = {
  auth: { strategy: 'jwt' },
  plugins: { acls: 'adminUsers.getBannedBoards' },
  validate: { params: { username: Joi.string().required() } },
  handler: function(request, reply) {
    var username = request.params.username;
    var promise = request.db.bans.getBannedBoards(username);
    return reply(promise);
  }
};

/**
  * @apiVersion 0.4.0
  * @apiGroup Users
  * @api {GET} /users/banned (Admin) Page by Banned Boards
  * @apiName PageByBannedBoardsAdmin
  * @apiPermission Super Administrator, Administrator, Global Moderator, Moderator
  * @apiDescription This allows Administrators and Moderators to page through users who have been
  * banned from boards.
  *
  * @apiParam (Query) {number{1..n}} [page=1] The page of results to return
  * @apiParam (Query) {number{1..100}} [limit=25] The number of results per page to return
  * @apiParam (Query) {string} [search] username, email, or user id to filter results by
  * @apiParam (Query) {string} [board] board id to filter results by
  * @apiParam (Query) {boolean} [modded] booolean which indicates to only retun users who were banned
  * from boards in which the logged in user moderates
  *
  * @apiSuccess {number} page The current page of results that is being returned
  * @apiSuccess {number} limit The current number of results that is being returned per page
  * @apiSuccess {boolean} next boolean indicating if there is a next page
  * @apiSuccess {boolean} prev boolean indicating if there is a previous page
  * @apiSuccess {string} search The search text that the results are being filtered by
  * @apiSuccess {string} board The board id that the results are being filtered by
  * @apiSuccess {boolean} modded boolean indicating that the results being returned are within the
  * users moderated boards
  * @apiSuccess {object[]} data An array of board banned users and board data
  * @apiSuccess {string} data.username The username of the board banned user
  * @apiSuccess {string} data.user_id The user id of the board banned user
  * @apiSuccess {string} data.email The email of the board banned user
  * @apiSuccess {string} data.created_at The created_at date of the board banned user's account
  * @apiSuccess {string[]} data.board_ids An array of the board ids this user is banned from
  * @apiSuccess {string[]} data.board_names An array of the board names this user is banned from
  *
  * @apiError (Error 500) InternalServerError There was error paging board banned users
  * @apiError (Error 403) Forbidden User doesn't have permission to query board banned users
  */
exports.byBannedBoards = {
  auth: { strategy: 'jwt' },
  plugins: { acls: 'adminUsers.byBannedBoards' },
  validate: {
    query: {
      page: Joi.number().integer().min(1).default(1),
      limit: Joi.number().integer().min(1).max(100).default(25),
      search: Joi.string(),
      board: Joi.string(),
      modded: Joi.boolean()
    }
  },
  handler: function(request, reply) {
    var opts = {
      page: request.query.page,
      limit: request.query.limit,
      search: request.query.search,
      boardId: request.query.board,
      userId: request.query.modded ? request.auth.credentials.id : undefined
    };
    var promise = request.db.bans.byBannedBoards(opts);
    return reply(promise);
  }
};
