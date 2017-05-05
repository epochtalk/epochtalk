var Joi = require('joi');
var Promise = require('bluebird');

module.exports = {
  method: 'POST',
  path: '/api/categories',
  config: {
    auth: { strategy: 'jwt' },
    plugins: { acls: 'categories.create' },
    validate: {
      payload: Joi.array().items(Joi.object().keys({
        name: Joi.string().min(1).max(255).required()
      })).unique().min(1)
    },
    pre: [
      { method: 'auth.categories.create(server, auth)' },
      { method: 'common.categories.clean(sanitizer, payload)' },
    ]
  },
  handler: function(request, reply) {
    var promise = Promise.map(request.payload, function(cat) {
      return request.db.categories.create(cat);
    })
    .error(request.errorMap.toHttpError);

    return reply(promise);
  }
};
