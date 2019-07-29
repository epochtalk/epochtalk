var path = require('path');
var fse = require('fs-extra');
var Promise = require('bluebird');
var baseCustomPath = __dirname + '/../../../content/legal/';
var baseDefaultPath = __dirname + '/../../../defaults/legal/';

/**
  * @apiVersion 0.4.0
  * @apiGroup Legal
  * @api {POST} /api/legal/reset (Admin) Reset Legal Text
  * @apiName ResetLegal
  * @apiDescription Used to reset legal text to default text
  *
  * @apiSuccess {string} tos The source html for the terms of service page
  * @apiSuccess {string} privacy The source html for the privacy page
  * @apiSuccess {string} disclaimer The source html for the disclaimer page
  *
  * @apiError (Error 500) InternalServerError There was an issue retrieving the ToS, privacy policy and disclaimer.
  *
  */
module.exports = {
  method: 'POST',
  path: '/api/legal/reset',
  options: {
    auth: { strategy: 'jwt' },
    pre: [ { method: (request) => request.server.methods.auth.legal.reset(request.server, request.auth) } ]
  },
  handler: function(request, reply) {
    var copyFile = function(fromDir, toDir, options) {
      return new Promise(function(resolve, reject) {
        fse.copy(fromDir, toDir, options, function(err) {
          if (err) { return reject(err); }
          else { return resolve(fse.readFileSync(toDir, 'utf8')); }
        });
      });
    };

    var tosCustomDir = path.normalize(baseCustomPath + 'tos.txt');
    var tosDefaultDir = path.normalize(baseDefaultPath + 'tos.txt');
    var resetTos = copyFile(tosDefaultDir, tosCustomDir, { clobber: true });

    var privacyCustomDir = path.normalize(baseCustomPath + 'privacy.txt');
    var privacyDefaultDir = path.normalize(baseDefaultPath + 'privacy.txt');
    var resetPrivacy = copyFile(privacyDefaultDir, privacyCustomDir, { clobber: true });

    var disclaimerCustomDir = path.normalize(baseCustomPath + 'disclaimer.txt');
    var disclaimerDefaultDir = path.normalize(baseDefaultPath + 'disclaimer.txt');
    var resetDisclaimer = copyFile(disclaimerDefaultDir, disclaimerCustomDir, { clobber: true });

    var promise = Promise.join(resetTos, resetPrivacy, resetDisclaimer, function(tos, privacy, disclaimer) {
      return {
        tos: tos,
        privacy: privacy,
        disclaimer: disclaimer
      };
    })
    .error(request.errorMap.toHttpError);

    return promise;
  }
};
