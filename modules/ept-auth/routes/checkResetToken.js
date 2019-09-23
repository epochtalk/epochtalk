var Joi = require('@hapi/joi');

/**
  * @api {GET} /reset/:username/:token/validate Validate Account Reset Token
  * @apiName AccountRecoveryToken
  * @apiGroup Auth
  * @apiVersion 0.4.0
  * @apiDescription Used to check the validity of the reset token. Verifys that the reset
  * token is for the correct user and that it is not expired.
  *
  * @apiParam {string} username The username of the user whose reset token is to be checked
  * @apiParam {string} token The token for resetting the account password
  *
  * @apiSuccess {boolean} token_valid true if the token is valid false if it is not
  * @apiSuccess {boolean} token_expired true if token is expired false if not. Undefined if token is invalid
  *
  * @apiError (Error 400) BadRequest The user account could not be found
  */
module.exports = {
  method: 'GET',
  path: '/api/reset/{username}/{token}/validate',
  options: {
    validate: {
      params: {
        username: Joi.string().min(1).max(255).required(),
        token: Joi.string().required()
      }
    }
  },
  handler: function(request) {
    var username = request.params.username;
    var token = request.params.token;
    var promise = request.db.users.userByUsername(username) // get full user info
    .then(function(user){
      var now = Date.now();
      var tokenValid = user.reset_token && user.reset_token === token;
      var tokenExpired =  user.reset_expiration && now > user.reset_expiration;
      return {
        token_valid: tokenValid,
        token_expired: tokenValid ? tokenExpired : undefined
      };
    })
    .error(request.errorMap.toHttpError)
    .catch(function() { return { token_valid: false }; });
    return promise;
  }
};
