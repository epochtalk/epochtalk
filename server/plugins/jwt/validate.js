var Boom = require('boom');
var path = require('path');
var redis = require(path.normalize(__dirname + '/../../../redis'));

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
  redis.getAsync(key)
  .then(function(result) {
    if (!result) { throw new Error('Token Not Found'); }

    var credentials = {};
    credentials.id = decodedToken.id;
    credentials.username = decodedToken.username;
    credentials.email = decodedToken.email;
    credentials.token = token;

    return cb(null, true, credentials);
  })
  .catch(function(err) {
    var error = Boom.unauthorized('Session is no longer valid.');
    return cb(error, false, {});
  });
};
