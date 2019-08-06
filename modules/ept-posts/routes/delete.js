var Joi = require('joi');

/**
  * @apiVersion 0.4.0
  * @apiGroup Posts
  * @api {DELETE} /posts/:id Delete
  * @apiName DeletePost
  * @apiPermission User (Post's Author) or Admin
  * @apiDescription Used to delete a post.
  *
  * @apiParam {string} id The Id of the post to delete
  *
  * @apiUse PostObjectSuccess
  * @apiSuccess {number} position The position of the post within the thread
  * @apiSuccess {timestamp} updated_at The updated at timestamp of the post
  * @apiSuccess {timestamp} imported_at The imported at timestamp of the post
  *
  * @apiError (Error 500) InternalServerError There was an issue deleting the post
  */
module.exports = {
  method: 'DELETE',
  path: '/api/posts/{id}',
  options: {
    auth: { strategy: 'jwt' },
    plugins: {
      mod_log: {
        type: 'posts.delete',
        data: { id: 'params.id' }
      }
    },
    validate: {
      params: { id: Joi.string().required() },
      query: { locked: Joi.boolean().default(false) }
    },
    pre: [
      { method: (request) => request.server.methods.auth.posts.delete(request.server, request.auth, request.params.id) },
      { method: (request) => request.server.methods.auth.posts.lock(request.server, request.auth, request.params.id, request.query) }
    ],
    handler: function(request) {
      var action = 'hidden';
      var promise = request.db.posts.delete(request)
      .tap(function() {
        if (request.query.locked) {
          action = 'hidden and locked';
          return request.db.posts.lock(request);
        }
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
              thread_url: config.publicUrl + '/threads/' + thread.id + '/posts?start=' + post.position + '#' + post.id,
              action: action
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
