var Joi = require('joi');
var Boom = require('boom');

/**
  * @apiVersion 0.4.0
  * @apiGroup Posts
  * @api {POST} /posts/:id Undelete
  * @apiName UndeletePost
  * @apiPermission User (Post's Author) or Admin
  * @apiDescription Used to undo a deleted post.
  *
  * @apiParam {string} id The Id of the post to undo deletion on
  *
  * @apiUse PostObjectSuccess
  *
  * @apiError (Error 400) BadRequest Post Not Deleted
  * @apiError (Error 500) InternalServerError There was an issue undeleting the post
  */
module.exports = {
  method: 'POST',
  path: '/api/posts/{id}/undelete',
  config: {
    auth: { strategy: 'jwt' },
    validate: { params: { id: Joi.string().required() } },
    pre: [ { method: 'auth.posts.delete(server, auth, params.id)'} ],
    handler: function(request, reply) {
      var promise = request.db.posts.undelete(request.params.id)
      .error(function(err) { return Boom.badRequest(err.message); });
      return reply(promise);
    }
  }
};
