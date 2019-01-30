var Joi = require('joi');
var Promise = require('bluebird');
var path = require('path');
var motdPath = path.normalize(__dirname + '/../../../content/motd/motd.txt');

/**
  * @apiVersion 0.4.0
  * @apiGroup MOTD
  * @api {GET} /motd Get Message of the Day
  * @apiName GetMOTD
  * @apiPermission User
  * @apiDescription Used to retrieve the message of the day
  *
  * @apiSuccess {string} motd The unparsed motd, may contain bbcode or markdown
  * @apiSuccess {string} motd_html The parsed motd html to display to users
  * @apiSuccess {boolean} main_view_only Lets the UI know to display on the main page or all pages
  *
  * @apiError (Error 500) InternalServerError There was an issue retrieving the Message of the Day
  */
var get = {
  method: 'GET',
  path: '/api/motd',
  config: {
    auth: { strategy: 'jwt' },
    plugins: { track_ip: true },
    pre: [ { method: 'auth.motd.get(server, auth)' } ]
  },
  handler: function(request, reply) {
    var promise = request.db.motd.get()
    .then(function(data) {
      return {
        motd: data.motd || "",
        motd_html: request.parser.parse(data.motd),
        main_view_only: data.main_view_only || false
      };
    })
    .error(request.errorMap.toHttpError);
    return reply(promise);
  }
};

/**
  * @apiVersion 0.4.0
  * @apiGroup MOTD
  * @api {PUT} /motd Set Message of the Day
  * @apiName SetMOTD
  * @apiPermission Super Administrator, Administrator
  * @apiDescription Used to set the message of the day
  *
  * @apiParam (Payload) {string} motd The unparse message of the day, may contain markdown or bbcode
  * @apiParam (Payload) {boolean} main_view_only Lets the UI know to display on the main page or all pages
  *
  * @apiSuccess {string} motd The unparsed motd, may contain bbcode or markdown
  * @apiSuccess {string} motd_html The parsed motd html to display to users
  * @apiSuccess {boolean} main_view_only Lets the UI know to display on the main page or all pages
  *
  * @apiError (Error 500) InternalServerError There was an issue saving the Message of the Day
  */
var save = {
  method: 'PUT',
  path: '/api/motd',
  config: {
    auth: { strategy: 'jwt' },
    plugins: { track_ip: true },
    validate: {
      payload: {
        motd: Joi.string().allow(''),
        main_view_only: Joi.boolean().default(false)
      }
    },
    pre: [ { method: 'auth.motd.save(server, auth)' } ]
  },
  handler: function(request, reply) {
    var data = request.payload;
    var promise = request.db.motd.save(data)
    .then(function() {
      return {
        motd: data.motd || "",
        motd_html: request.sanitizer.bbcode(request.parser.parse(data.motd)),
        main_view_only: data.main_view_only || false
      };
    });
    return reply(promise);
  }
};

module.exports = [ get, save ];
