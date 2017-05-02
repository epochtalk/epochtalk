var Joi = require('joi');

module.exports = {
  method: 'GET',
  path: '/api/categories/{id}',
  config: {
    auth: { strategy: 'jwt' },
    plugins: { acls: 'categories.find' },
    validate: { params: { id: Joi.string().required() } },
    pre: [ { method: 'auth.categories.find(server, auth)' } ],
  },
  handler: function(request, reply) {
    var promise = request.db.categories.find(request.params.id)
    .error(request.errorMap.toHttpError);

    return reply(promise);
  }
};
