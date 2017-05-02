var Joi = require('joi');

/**
  * @apiVersion 0.4.0
  * @apiGroup Users
  * @api {GET} /user/notes (Admin) Page User Notes
  * @apiName PageUserNotesAdmin
  * @apiPermission Super Administrator, Administrator, Global Moderator, Moderator
  * @apiDescription This allows Administrators and Moderators to page through user notes
  *
  * @apiParam (Query) {number{1..n}} [page] The page of results to return
  * @apiParam (Query) {number{1..100}} [limit] The number of results per page to return
  * @apiParam (Query) {string} user_id The id of the user whose notes to page through
  *
  * @apiSuccess {string} user_id The id of the user whose notes are being returned
  * @apiSuccess {number} page The current page of results that is being returned
  * @apiSuccess {number} limit The current number of results that is being returned per page
  * @apiSuccess {boolean} next boolean indicating if there is a next page
  * @apiSuccess {boolean} prev boolean indicating if there is a previous page
  * @apiSuccess {object[]} data An array of user notes
  * @apiSuccess {string} data.id The id of the user note
  * @apiSuccess {string} data.author_id The user id of the admin or mod who left the note
  * @apiSuccess {string} data.author_name The username of the admin or mod who left the note
  * @apiSuccess {string} data.author_avatar The avatar of the admin or mod who left the note
  * @apiSuccess {string} data.author_highlight_color The highlight color of the admin or mod who left the note
  * @apiSuccess {string} data.note The note left by the admin or mod
  * @apiSuccess {timestamp} data.created_at The created at timestamp of the note
  * @apiSuccess {timestamp} data.updated_at The updated at timestamp of the note
  *
  * @apiError (Error 500) InternalServerError There was error paging user notes
  * @apiError (Error 403) Forbidden User doesn't have permission to query user notes
  */
exports.page = {
 auth: { strategy: 'jwt' },
 plugins: { acls: 'userNotes.page' },
  validate: {
    query: {
      user_id: Joi.string().required(),
      page: Joi.number().min(1),
      limit: Joi.number().min(1).max(100)
    }
  },
  handler: function(request, reply) {
    var opts = request.query;
    var promise =  request.db.userNotes.page(opts)
    .error(request.errorMap.toHttpError);

    return reply(promise);
  }
};

/**
  * @apiVersion 0.4.0
  * @apiGroup Users
  * @api {POST} /user/notes (Admin) Create User Note
  * @apiName CreateUserNotesAdmin
  * @apiPermission Super Administrator, Administrator, Global Moderator, Moderator
  * @apiDescription This allows Administrators and Moderators to create user notes
  *
  * @apiParam (Payload) {string} user_id The id of the user who the note is being left on
  * @apiParam (Payload) {string} author_id The id of the user leaving the note
  * @apiParam (Payload) {string} note The note being left on the user's account
  *
  * @apiSuccess {string} id The id of the user note
  * @apiSuccess {string} user_id The id of the user who the note is being left on
  * @apiSuccess {string} author_id The id of the user leaving the note
  * @apiSuccess {string} note The note being left on the user's account
  * @apiSuccess {timestamp} created_at The created at timestamp of the note
  * @apiSuccess {timestamp} updated_at The updated at timestamp of the note
  *
  * @apiError (Error 500) InternalServerError There was error creating user note
  * @apiError (Error 403) Forbidden User doesn't have permission to create user note
  */
exports.create = {
  auth: { strategy: 'jwt' },
  plugins: {
    acls: 'userNotes.create',
    mod_log: {
      type: 'userNotes.create',
      data: {
        id: 'route.settings.plugins.mod_log.metadata.id',
        user_id: 'route.settings.plugins.mod_log.metadata.user_id',
        author_id: 'route.settings.plugins.mod_log.metadata.author_id',
        note: 'route.settings.plugins.mod_log.metadata.note',
        created_at: 'route.settings.plugins.mod_log.metadata.created_at',
        updated_at: 'route.settings.plugins.mod_log.metadata.updated_at'
      }
    }
  },
  validate: {
    payload: {
      user_id: Joi.string().required(),
      author_id: Joi.string().required(),
      note: Joi.string().min(2).max(2000).required()
    }
  },
  handler: function(request, reply) {
    var opts = Object.assign({}, request.payload);
    var promise =  request.db.userNotes.create(opts)
    .then(function(createdNote) {
      request.route.settings.plugins.mod_log.metadata = createdNote;
      return createdNote;
    })
    .error(request.errorMap.toHttpError);

    return reply(promise);
  }
};

/**
  * @apiVersion 0.4.0
  * @apiGroup Users
  * @api {PUT} /user/notes (Admin) Update User Note
  * @apiName UpdateUserNotesAdmin
  * @apiPermission Super Administrator, Administrator, Global Moderator, Moderator
  * @apiDescription This allows Administrators and Moderators to update user notes
  *
  * @apiParam (Payload) {string} id The id of the note to update
  * @apiParam (Payload) {string} note The updated note
  *
  * @apiSuccess {string} id The id of the user note
  * @apiSuccess {string} user_id The id of the user who the note is being left on
  * @apiSuccess {string} author_id The id of the user leaving the note
  * @apiSuccess {string} note The note being left on the user's account
  * @apiSuccess {timestamp} created_at The created at timestamp of the note
  * @apiSuccess {timestamp} updated_at The updated at timestamp of the note
  *
  * @apiError (Error 500) InternalServerError There was error updating user note
  * @apiError (Error 403) Forbidden User doesn't have permission to update the user note
  */
exports.update = {
  auth: { strategy: 'jwt' },
  plugins: {
    acls: 'userNotes.update',
    mod_log: {
      type: 'userNotes.update',
      data: {
        id: 'route.settings.plugins.mod_log.metadata.id',
        user_id: 'route.settings.plugins.mod_log.metadata.user_id',
        author_id: 'route.settings.plugins.mod_log.metadata.author_id',
        note: 'route.settings.plugins.mod_log.metadata.note',
        created_at: 'route.settings.plugins.mod_log.metadata.created_at',
        updated_at: 'route.settings.plugins.mod_log.metadata.updated_at'
      }
    }
  },
  validate: {
    payload: {
      id: Joi.string().required(),
      note: Joi.string().min(2).max(2000).required()
    }
  },
  pre: [ { method: 'auth.userNotes.isOwner(server, auth, payload.id)' } ],
  handler: function(request, reply) {
    var opts = Object.assign({}, request.payload);
    var promise =  request.db.userNotes.update(opts)
    .then(function(updatedNote) {
      request.route.settings.plugins.mod_log.metadata = updatedNote;
      return updatedNote;
    })
    .error(request.errorMap.toHttpError);

    return reply(promise);
  }
};

/**
  * @apiVersion 0.4.0
  * @apiGroup Users
  * @api {DELETE} /user/notes (Admin) Delete User Note
  * @apiName DeleteUserNotesAdmin
  * @apiPermission Super Administrator, Administrator, Global Moderator, Moderator
  * @apiDescription This allows Administrators and Moderators to delete user notes
  *
  * @apiParam (Query) {string} id The id of the note to delete
  *
  * @apiSuccess {string} id The id of the user note being deleted
  * @apiSuccess {string} user_id The id of the user who the note is being left on
  * @apiSuccess {string} author_id The id of the user leaving the note
  * @apiSuccess {string} note The note being left on the user's account
  * @apiSuccess {timestamp} created_at The created at timestamp of the note
  * @apiSuccess {timestamp} updated_at The updated at timestamp of the note
  *
  * @apiError (Error 500) InternalServerError There was error deleting the user note
  * @apiError (Error 403) Forbidden User doesn't have permission to delete user note
  */
exports.delete = {
  auth: { strategy: 'jwt' },
  plugins: {
    acls: 'userNotes.delete',
    mod_log: {
      type: 'userNotes.delete',
      data: {
        id: 'route.settings.plugins.mod_log.metadata.id',
        user_id: 'route.settings.plugins.mod_log.metadata.user_id',
        author_id: 'route.settings.plugins.mod_log.metadata.author_id',
        note: 'route.settings.plugins.mod_log.metadata.note',
        created_at: 'route.settings.plugins.mod_log.metadata.created_at',
        updated_at: 'route.settings.plugins.mod_log.metadata.updated_at'
      }
    }
  },
  validate: { query: { id: Joi.string().required() } },
  pre: [ { method: 'auth.userNotes.isOwner(server, auth, query.id)' } ],
  handler: function(request, reply) {
    var opts = Object.assign({}, request.query);
    var promise =  request.db.userNotes.delete(opts.id)
    .then(function(deletedNote) {
      request.route.settings.plugins.mod_log.metadata = deletedNote;
      return deletedNote;
    })
    .error(request.errorMap.toHttpError);

    return reply(promise);
  }
};
