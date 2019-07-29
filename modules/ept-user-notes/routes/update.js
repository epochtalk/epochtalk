var Joi = require('joi');

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
  * @apiError (Error 500) InternalServerError There was an error updating user note
  * @apiError (Error 403) Forbidden User doesn't have permission to update the user note
  */
module.exports = {
  method: 'PUT',
  path: '/api/user/notes',
  options: {
    auth: { strategy: 'jwt' },
    plugins: {
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
    pre: [ { method: (request) => request.server.methods.auth.userNotes.update(request.server, request.auth, request.payload.id) } ]
  },
  handler: function(request, reply) {
    var opts = Object.assign({}, request.payload);
    var promise =  request.db.userNotes.update(opts)
    .then(function(updatedNote) {
      request.route.settings.plugins.mod_log.metadata = updatedNote;
      return updatedNote;
    })
    .error(request.errorMap.toHttpError);

    return promise;
  }
};
