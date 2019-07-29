var Joi = require('joi');

module.exports = {
  method: 'POST',
  path: '/api/images/policy',
  options: {
    auth: { strategy: 'jwt' },
    validate: { payload: Joi.array().items(Joi.string().required()).min(1) }
  },
  handler: function(request, reply) {
    var filenames = request.payload;
    var policies = filenames.map(function(filename) {
      return request.imageStore.uploadPolicy(filename);
    });
    return policies;
  }
};
