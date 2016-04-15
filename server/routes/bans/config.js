var Joi = require('joi');

/*----- Banned Addresses -----*/

exports.addAddresses = {
  auth: { strategy: 'jwt' },
  plugins: {
    acls: 'bans.addAddresses',
    mod_log: {
      type: 'bans.addAddresses',
      data: { addresses: 'payload' }
    }
  },
  validate: {
    payload: Joi.array(Joi.object().keys({
      hostname: Joi.string(),
      ip: Joi.string(),
      weight: Joi.number().required(),
      decay: Joi.boolean().default(false),
    }).without('hostname', 'ip'))
  },
  handler: function(request, reply) {
    var addresses = request.payload;
    var promise =  request.db.bans.addAddresses(addresses);
    return reply(promise);
  }
};

exports.pageBannedAddresses = {
  auth: { strategy: 'jwt' },
  plugins: { acls: 'bans.pageBannedAddresses' },
  validate: {
    query: {
      page: Joi.number().min(1),
      limit: Joi.number().min(1).max(100),
      desc: Joi.boolean().default(true),
      field: Joi.string().valid('created_at', 'updates', 'decay', 'weight', 'hostname', 'update_count'),
      search: Joi.string().optional()
    }
  },
  handler: function(request, reply) {
    var opts = request.query;
    var promise =  request.db.bans.pageBannedAddresses(opts);
    return reply(promise);
  }
};

exports.editAddress = {
  auth: { strategy: 'jwt' },
  plugins: {
    acls: 'bans.editAddress',
    mod_log: {
      type: 'bans.editAddress',
      data: {
        hostname: 'payload.hostname',
        ip: 'payload.ip',
        weight: 'payload.weight',
        decay: 'payload.decay'
      }
    }
 },
  validate: {
    payload: Joi.object().keys({
      hostname: Joi.string(),
      ip: Joi.string(),
      weight: Joi.number().required(),
      decay: Joi.boolean().default(false),
    }).without('hostname', 'ip')
  },
  handler: function(request, reply) {
    var address = request.payload;
    console.log(address);
    var promise =  request.db.bans.editAddress(address);
    return reply(promise);
  }
};

exports.deleteAddress = {
  auth: { strategy: 'jwt' },
  plugins: {
    acls: 'bans.deleteAddress',
    mod_log: {
      type: 'bans.deleteAddress',
      data: {
        hostname: 'query.hostname',
        ip: 'query.ip'
      }
    }
  },
  validate: {
    query:{
      hostname: Joi.string(),
      ip: Joi.string()
    }
  },
  handler: function(request, reply) {
    var address = request.query;
    var promise =  request.db.bans.deleteAddress(address);
    return reply(promise);
  }
};

/*----- Ban User Accounts -----*/

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
    privilege: 'bans.privilegedBan'
  },
  auth: { strategy: 'jwt' },
  plugins: {
    acls: 'bans.ban',
    mod_log: {
      type: 'bans.ban',
      data: {
        user_id: 'payload.user_id',
        expiration: 'payload.expiration'
      }
    }
  },
  validate: {
    payload: {
      user_id: Joi.string().required(),
      expiration: Joi.date(),
      ip_ban: Joi.boolean().default(false)
    }
  },
  pre: [ { method: 'auth.admin.bans.ban(server, auth, payload.user_id)' } ],
  handler: function(request, reply) {
    var userId = request.payload.user_id;
    var expiration = request.payload.expiration || null;
    var ipBan = request.payload.ip_ban;
    var banPromise = request.db.bans.ban(userId, expiration)
    .then(function(user) {
      return request.session.updateRoles(user.user_id, user.roles)
      .then(function() { return request.session.updateBanInfo(user.user_id, user.expiration); })
      .then(function() { return user; });
    });
    // If user is being ip banned copy their known ips into banned_addresses
    if (ipBan) {
      // TODO: Can be customized by passing weight and decay in payload
      var opts = { userId: userId, weight: 50, decay: true };
      var ipBanPromise = request.db.bans.copyUserIps(opts);
      return Promise.join(banPromise, ipBanPromise, function(result) {
        return reply(result);
      });
    }
    else { return reply(banPromise); }
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
    privilege: 'bans.privilegedBan'
  },
  auth: { strategy: 'jwt' },
  plugins: {
    acls: 'bans.unban',
    mod_log: {
      type: 'bans.unban',
      data: { user_id: 'payload.user_id' }
    }
  },
  validate: { payload: { user_id: Joi.string().required() } },
  pre: [ { method: 'auth.admin.bans.ban(server, auth, payload.user_id)' } ],
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

/*----- Ban User From Boards -----*/

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
    acls: 'bans.banFromBoards',
    mod_log: {
      type: 'bans.banFromBoards',
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
  pre: [ { method: 'auth.admin.bans.banFromBoards(server, auth, payload.user_id, payload.board_ids)' } ],
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
    acls: 'bans.unbanFromBoards',
    mod_log: {
      type: 'bans.unbanFromBoards',
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
  pre: [ { method: 'auth.admin.bans.banFromBoards(server, auth, payload.user_id, payload.board_ids)' } ],
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
  plugins: { acls: 'bans.getBannedBoards' },
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
  plugins: { acls: 'bans.byBannedBoards' },
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
