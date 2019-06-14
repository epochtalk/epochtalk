var path = require('path');
var fse = require('fs-extra');
var Promise = require('bluebird');
var baseCustomPath = __dirname + '/../../../content/legal/';
var baseDefaultPath = __dirname + '/../../../defaults/legal/';

/**
  * @apiVersion 0.4.0
  * @apiGroup Legal
  * @api {GET} /api/legal (Admin) Text
  * @apiName LegalText
  * @apiDescription Used to fetch the ToS, privacy policy and disclaimer to be updated by the user.
  *
  * @apiSuccess {string} tos The source html for the terms of service page
  * @apiSuccess {string} privacy The source html for the privacy page
  * @apiSuccess {string} disclaimer The source html for the disclaimer page
  *
  * @apiError (Error 500) InternalServerError There was an issue retrieving the ToS, privacy policy and disclaimer.
  *
  */
module.exports = {
  method: 'GET',
  path: '/api/legal',
  config: {
    auth: { strategy: 'jwt' },
    plugins: { acls: 'adminLegal.text' }
  },
  handler: function(request, reply) {
    var getFile = function(customDir, defaultDir) {
      return new Promise(function(resolve) {
        fse.stat(customDir, function(err, stat) {
          var readDir;
          if (!err && stat.isFile()) { readDir = customDir; }
          else { readDir = defaultDir; }
          return resolve(fse.readFileSync(readDir, 'utf8'));
        });
      });
    };

    var tosCustomDir = path.normalize(baseCustomPath + 'tos.txt');
    var tosDefaultDir = path.normalize(baseDefaultPath + 'tos.txt');
    var getTos = getFile(tosCustomDir, tosDefaultDir);

    var privacyCustomDir = path.normalize(baseCustomPath + 'privacy.txt');
    var privacyDefaultDir = path.normalize(baseDefaultPath + 'privacy.txt');
    var getPrivacy = getFile(privacyCustomDir, privacyDefaultDir);

    var disclaimerCustomDir = path.normalize(baseCustomPath + 'disclaimer.txt');
    var disclaimerDefaultDir = path.normalize(baseDefaultPath + 'disclaimer.txt');
    var getDisclaimer = getFile(disclaimerCustomDir, disclaimerDefaultDir);


    var promise = Promise.join(getTos, getPrivacy, getDisclaimer, function(tos, privacy, disclaimer) {
      disclaimer = disclaimer === 'undefined' ? '' : disclaimer;
      return {
        tos: tos,
        privacy: privacy,
        disclaimer: disclaimer
      };
    })
    .error(request.errorMap.toHttpError);

    return reply(promise);
  }
};
