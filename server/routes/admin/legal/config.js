var Joi = require('joi');
var path = require('path');
var fse = require('fs-extra');
var Promise = require('bluebird');
var baseCustomPath = __dirname + '/../../../../content/legal/';
var baseDefaultPath = __dirname + '/../../../../defaults/legal/';

/**
  * @apiVersion 0.4.0
  * @apiGroup Legal
  * @api {GET} /admin/legal (Admin) Text
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
exports.text = {
  auth: { strategy: 'jwt' },
  plugins: { acls: 'adminLegal.text' },
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

/**
  * @apiVersion 0.4.0
  * @apiGroup Legal
  * @api {PUT} /admin/legal (Admin) Update
  * @apiName UpdateLegal
  * @apiDescription Used to update all legal text: ToS, privacy policy, disclaimers.
  *
  * @apiParam (Payload) {string} [tos] The updated Terms of Service.
  * @apiParam (Payload) {string} [privacy] The updated privacy policy.
  * @apiParam (Payload) {string} [disclaimer] The updated disclaimer.
  *
  * @apiSuccess {object} success 200 OK
  *
  * @apiError (Error 500) InternalServerError There was an issue retrieving the ToS, privacy policy and disclaimer.
  *
  */
exports.update = {
  auth: { strategy: 'jwt' },
  plugins: {
    acls: 'adminLegal.update',
    // mod_log: { type: 'adminSettings.update' }
  },
  validate: {
    payload: Joi.object().keys({
      tos: Joi.string().allow(''),
      privacy: Joi.string().allow(''),
      disclaimer: Joi.string().allow('')
    })
  },
  handler: function(request, reply) {
    var writeFile = function(path, text) {
      return new Promise(function(resolve, reject) {
        fse.outputFile(path, text, function(err) {
          if (err) { return reject(err); }
          else { return resolve(); }
        });
      });
    };

    var tosCustomPath = path.normalize(baseCustomPath + 'tos.txt');
    var writeTos = writeFile(tosCustomPath, request.payload.tos);

    var privacyCustomPath = path.normalize(baseCustomPath + 'privacy.txt');
    var writePrivacy = writeFile(privacyCustomPath, request.payload.privacy);

    var disclaimerCustomPath = path.normalize(baseCustomPath + 'disclaimer.txt');
    var writeDisclaimer = writeFile(disclaimerCustomPath, request.payload.disclaimer);

    var promise = Promise.join(writeTos, writePrivacy, writeDisclaimer, function() { return; })
    .error(request.errorMap.toHttpError);

    return reply(promise);
  }
};

/**
  * @apiVersion 0.4.0
  * @apiGroup Legal
  * @api {POST} /admin/legal/reset (Admin) Reset Legal Text
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
exports.reset = {
  auth: { strategy: 'jwt' },
  plugins: { acls: 'adminLegal.reset' },
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

    return reply(promise);
  }
};
