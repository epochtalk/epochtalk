var Joi = require('joi');

/**
  * @api {GET} /register/email/:email Email Availability
  * @apiName Email Availability
  * @apiGroup Auth
  * @apiVersion 0.4.0
  * @apiDescription Used to check if an email is available when registering a new account.
  *
  * @apiParam {string} email The email to check
  *
  * @apiSuccess {boolean} found true if email exists false if not
  *
  * @apiError (Error 500) InternalServerError There was an issue checking email availability
  */
module.exports = {
  method: 'GET',
  path: '/api/register/email/{email}',
  config: {
    validate: { params: { email: Joi.string().email().required() } }
  },
  handler: function(request, reply) {
    var email = request.params.email;
    var promise = request.db.users.userByEmail(email) // get full user info
    .then(function(user) { return { found: !!user }; })
    .error(request.errorMap.toHttpError);

    return reply(promise);
  }
};
