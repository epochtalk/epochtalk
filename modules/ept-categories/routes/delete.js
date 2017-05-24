var Joi = require('joi');
var Promise = require('bluebird');

/**
  * @apiVersion 0.4.0
  * @apiGroup Categories
  * @api {POST} /categories/delete Delete Categories
  * @apiName DeleteCategories
  * @apiPermission Super Administrator, Administrator
  * @apiDescription Used to delete categories
  *
  * @apiParam (Payload) {string[]} category_ids Array of category ids to delete
  *
  * @apiSuccess {string[]} category_ids Array of deleted category ids
  *
  * @apiError (Error 500) InternalServerError There was an issue deleting the categories
  */
module.exports = {
  method: 'POST',
  path: '/api/categories/delete',
  config: {
    auth: { strategy: 'jwt' },
    plugins: { acls: 'categories.delete' },
    validate: {
      payload: {
        category_ids: Joi.array().items(Joi.string().required()).unique().min(1)
      }
    },
    pre: [ { method: 'auth.categories.delete(server, auth)' } ]
  },
  handler: function(request, reply) {
    var promise = Promise.map(request.payload.category_ids, function(catId) {
      return request.db.categories.delete(catId)
      .then(function() { return catId; });
    })
    .then(function(deletedIds) {
      return { category_ids: deletedIds };
    })
    .error(request.errorMap.toHttpError);

    return reply(promise);
  }
};
