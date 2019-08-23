var Joi = require('joi');

/**
  * @apiVersion 0.4.0
  * @apiGroup Threads
  * @api {DELETE} /threads/:id/purge Purge
  * @apiName PurgeThread
  * @apiPermission Super Administrator, Administrator, Global Moderator, Moderator
  * @apiDescription Used to purge a thread.
  *
  * @apiParam {string} id The unique id of the thread to purge
  *
  * @apiSuccess {object} success 200 OK
  *
  * @apiError (Error 401) Unauthorized User doesn't have permissions to purge the thread
  * @apiError (Error 500) InternalServerError There was an issue purging the thread
  */
module.exports = {
  method: 'DELETE',
  path: '/api/threads/{id}',
  options: {
    auth: { strategy: 'jwt' },
    plugins: {
      mod_log: {
        type: 'threads.purge',
        data: {
          id: 'params.id',
          title: 'route.settings.plugins.mod_log.metadata.title',
          user_id: 'route.settings.plugins.mod_log.metadata.user_id',
          board_id: 'route.settings.plugins.mod_log.metadata.board_id'
        }
      }
    },
    validate: { params: { id: Joi.string().required() } },
    pre: [ { method: (request) => request.server.methods.auth.threads.purge(request.server, request.auth, request.params.id) } ]
  },
  handler: function(request) {
    var promise = request.db.threads.purge(request.params.id)
    .tap(function(thread) {
      thread.poster_ids.forEach(function(userId) {
        var email;
        // Email thread author
        if (userId === request.auth.credentials.id) {
          return request.db.users.find(userId)
          .then(function(user) { email = user.email; })
          .then(function() {
            var config = request.server.app.config;
            var emailParams = {
              email: email,
              mod_username: request.auth.credentials.username,
              thread_name: thread.title,
              site_name: config.website.title,
              site_url: config.publicUrl,
              action: 'created'
            };
            request.server.log('debug', emailParams);
            request.emailer.send('threadDeleted', emailParams)
            .catch(console.log);
            return;
          });
        }
        // Email thread participants
        else {
          return request.db.users.find(userId)
          .then(function(user) { email = user.email; })
          .then(function() {
            var config = request.server.app.config;
            var emailParams = {
              email: email,
              mod_username: request.auth.credentials.username,
              thread_name: thread.title,
              site_name: config.website.title,
              site_url: config.publicUrl,
              action: 'participated in'
            };
            request.server.log('debug', emailParams);
            request.emailer.send('threadDeleted', emailParams)
            .catch(console.log);
            return;
          });
        }
      });
      return thread;
    })
    .then(function(purgedThread) {
      // append purged thread data to plugin metadata
      request.route.settings.plugins.mod_log.metadata = {
        title: purgedThread.title,
        user_id: purgedThread.user_id,
        board_id: purgedThread.board_id
      };
      return purgedThread;
    })
    .error(request.errorMap.toHttpError);

    return promise;
  }
};
