var request = require('request');
var Promise = require('bluebird');

/* Existing Templates
 * ------------------
 * recoverAccount: email for resetting password
 */

exports.send = function(templateName, params) {
  return new Promise(function(resolve, reject) {
    request.post({
      url: 'http://unix:/tmp/epochEmailer.sock:/' + templateName,
      formData: params
    }, function(err, res, body) {
      if (err || body.error) {
        reject(err || body.error);
      }
      else { resolve(body); }
    });
  });
};
