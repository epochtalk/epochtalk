var Joi = require('joi');

/**
  * @api {GET} /register/username/:username Username Availability
  * @apiName Username Availability
  * @apiGroup Auth
  * @apiVersion 0.4.0
  * @apiDescription Used to check if a username is available when registering a new account.
  *
  * @apiParam {string} username The username to check
  *
  * @apiSuccess {boolean} found true if username exists false if not
  */
module.exports = {
  method: 'GET',
  path: '/api/register/username/{username}',
  options: {
    validate: { params: { username: Joi.string().min(1).max(255).required() } }
  },
  handler: function(request) {
    var username = request.params.username;
    var promise = request.db.users.userByUsername(username) // get full user info
    .then(function(user) { return { found: !!user }; })
    .error(request.errorMap.toHttpError);

    return promise;
  }
};
