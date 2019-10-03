var Joi = require('@hapi/joi');

/**
  * @apiVersion 0.4.0
  * @apiGroup Posts
  * @api {DELETE} /posts/:id/purge Purge
  * @apiName PurgePost
  * @apiPermission Admin
  * @apiDescription Used to purge a post.
  *
  * @apiParam {string} id The Id of the post to purge
  *
  * @apiSuccess {string} user_id The id of the user who created the post
  * @apiSuccess {string} thread_id The id of the thread that the post belonged to
  *
  * @apiError (Error 500) InternalServerError There was an issue purging the post
  */
module.exports = {
  method: 'DELETE',
  path: '/api/posts/{id}/purge',
  options: {
    app: { post_id: 'params.id' },
    auth: { strategy: 'jwt' },
    plugins: {
      mod_log: {
        type: 'posts.purge',
        data: {
          id: 'params.id',
          user_id: 'route.settings.plugins.mod_log.metadata.user_id',
          thread_id: 'route.settings.plugins.mod_log.metadata.thread_id'
        }
      }
    },
    validate: { params: Joi.object({ id: Joi.string().required() }) },
    pre: [ { method: (request) => request.server.methods.auth.posts.purge(request.server, request.auth, request.params.id) } ],
    handler: function(request) {
      var promise = request.db.posts.purge(request.params.id)
      .then(function(purgedPost) {
        // append purged post data to plugin metadata
        request.route.settings.plugins.mod_log.metadata = {
          user_id: purgedPost.user_id,
          thread_id: purgedPost.thread_id
        };
        return purgedPost;
      })
      .tap(function(post) {
        var email;
        if (post.user_id !== request.auth.credentials.id) {
          request.db.users.find(post.user_id)
          .then(function(user) {
            email = user.email;
            return request.db.threads.find(post.thread_id);
          })
          .then(function(thread) {
            var config = request.server.app.config;
            var emailParams = {
              email: email,
              mod_username: request.auth.credentials.username,
              thread_name: thread.title,
              site_name: config.website.title,
              thread_url: config.publicUrl + '/threads/' + thread.id + '/posts',
              action: 'deleted'
            };
            request.server.log('debug', emailParams);
            request.emailer.send('postUpdated', emailParams)
            .catch(console.log);
            return;
          });
        }
        return;
      })
      .error(request.errorMap.toHttpError);

      return promise;
    }
  }
};
