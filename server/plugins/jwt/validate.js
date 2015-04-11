var Boom = require('boom');
var path = require('path');
var memDb = require(path.normalize(__dirname + '/../../memstore')).db;

/**
 * JWT
 * decodedToken, the decrypted value in the token
 *   -- { username, user_id, email }
 * cb(err, isValid, credentials),
 *   -- isValid, if true if decodedToken matches a user token
 *   -- credentials, the user short object to be tied to request.auth.credentials
 */
module.exports = function(decodedToken, token, cb) {
  // get id from decodedToken to query memDown with for token
  var key = decodedToken.id + token;
  memDb.get(key, function(err, savedToken) {
    var error;
    var isValid = false;
    var credentials = {};

    if (err) { error = Boom.unauthorized('Session is no longer valid.'); }

    // check if the token from memDown matches the token we got in the request
    // if it matches, then the token from the request is still valid
    if (!error) {
      isValid = true;
      credentials.id = decodedToken.id;
      credentials.username = decodedToken.username;
      credentials.email = decodedToken.email;
      credentials.token = token;
    }

    // return if token valid with user credentials
    return cb(error, isValid, credentials);
  });
};
