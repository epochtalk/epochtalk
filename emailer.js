var request = require('request');
var Promise = require('bluebird');
var os = require('os');
var emailerSocketPath = 'http://unix:/var/run/epochEmailer.sock:/';
if (os === 'darwin') {
  emailerSocketPath = 'http://unix:/tmp/epochEmailer.sock:/';
}

exports.send = function(templateName, params) {
  return new Promise(function(resolve, reject) {
    request.post({
      url: emailerSocketPath + templateName,
      formData: params
    }, function(err, res, body) {
      if (err || body.error) {
        reject(err || body.error);
      }
      else {
        resolve(body);
      }
    });
  });
};
