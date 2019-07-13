var Joi = require('joi');

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
  * @apiError (Error 500) InternalServerError There was an error deleting the user note
  * @apiError (Error 403) Forbidden User doesn't have permission to delete user note
  */
module.exports = {
  method: 'DELETE',
  path: '/api/user/notes',
  config: {
    auth: { strategy: 'jwt' },
    plugins: {
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
    pre: [ { method: 'auth.userNotes.delete(request.server, request.auth, request.query.id)' } ]
  },
  handler: function(request, reply) {
    var opts = Object.assign({}, request.query);
    var promise =  request.db.userNotes.delete(opts.id)
    .then(function(deletedNote) {
      request.route.settings.plugins.mod_log.metadata = deletedNote;
      return deletedNote;
    })
    .error(request.errorMap.toHttpError);

    return promise;
  }
};
