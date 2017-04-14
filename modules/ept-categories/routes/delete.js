var Joi = require('joi');
var Promise = require('bluebird');

module.exports = {
  method: 'POST',
  path: '/api/categories/delete',
  config: {
    auth: { strategy: 'jwt' },
    plugins: { acls: 'categories.delete' },
    validate: { payload: Joi.array().items(Joi.string().required()).unique().min(1) },
    pre: [ { method: 'auth.categories.delete(server, auth)' } ]
  },
  handler: function(request, reply) {
    var promise = Promise.map(request.payload, function(catId) {
      return request.db.categories.delete(catId)
      .then(function() { return catId; });
    })
    .error(request.errorMap.toHttpError);

    return reply(promise);
  }
};
