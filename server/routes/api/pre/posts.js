var core = require('epochcore')();
var Hapi = require('hapi');

module.exports = {
  authPost: function(request, reply) {
    var userId = request.auth.credentials.id;
    var postId = request.params.id;

    core.posts.find(postId)
    .then(function(post) {
      var authError;

      if (post.user_id !== userId) {
        authError = Hapi.error.badRequest('User did not create this post.');
      }

      return reply(authError);
    })
    .catch(function(err) {
      var error = Hapi.error.badRequest('Post Not Found');
      return reply(error);
    });
  }
};
