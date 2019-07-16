var Joi = require('joi');

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
  * @apiError (Error 500) InternalServerError There was an error creating user note
  * @apiError (Error 403) Forbidden User doesn't have permission to create user note
  */
module.exports = {
  method: 'POST',
  path: '/api/user/notes',
  config: {
    auth: { strategy: 'jwt' },
    plugins: {
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
    pre: [ { method: (request) => request.server.methods.auth.userNotes.create(request.server, request.auth) } ]
  },
  handler: function(request, reply) {
    var opts = Object.assign({}, request.payload);
    var promise =  request.db.userNotes.create(opts)
    .then(function(createdNote) {
      request.route.settings.plugins.mod_log.metadata = createdNote;
      return createdNote;
    })
    .error(request.errorMap.toHttpError);

    return promise;
  }
};
