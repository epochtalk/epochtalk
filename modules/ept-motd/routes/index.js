var Joi = require('joi');
var Promise = require('bluebird');
var path = require('path');
var motdPath = path.normalize(__dirname + '/../../../content/motd/motd.txt');


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
