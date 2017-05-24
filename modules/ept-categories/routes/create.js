var Joi = require('joi');
var Promise = require('bluebird');

/**
  * @apiVersion 0.4.0
  * @apiGroup Categories
  * @api {POST} /categories Create Categories
  * @apiName CreateCategories
  * @apiPermission Super Administrator, Administrator
  * @apiDescription Used to create categories
  *
  * @apiParam (Payload) {string[]} categories Array of category names
  *
  * @apiSuccess {object[]} categories Array of created category
  * @apiSuccess {string} categories.id The id of the newly created category
  * @apiSuccess {string} categories.name The name of the newly created category
  *
  * @apiError (Error 500) InternalServerError There was an issue creating the categories
  */
module.exports = {
  method: 'POST',
  path: '/api/categories',
  config: {
    auth: { strategy: 'jwt' },
    plugins: { acls: 'categories.create' },
    validate: {
      payload: {
        categories: Joi.array().items(Joi.object().keys({
          name: Joi.string().min(1).max(255).required()
        })).min(1)
      }
    },
    pre: [
      { method: 'auth.categories.create(server, auth)' },
      { method: 'common.categories.clean(sanitizer, payload)' },
    ]
  },
  handler: function(request, reply) {
    var promise = Promise.map(request.payload.categories, function(cat) {
      return request.db.categories.create(cat);
    })
    .error(request.errorMap.toHttpError);

    return reply(promise);
  }
};
