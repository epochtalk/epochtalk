var Joi = require('joi');
var Boom = require('boom');
var path = require('path');
var db = require(path.normalize(__dirname + '/../db'));
var autoModerator = require(path.normalize(__dirname + '/../autoModerator'));

function auth(request, reply) {
  var promise = request.server.authorization.build({
    error: Boom.forbidden(),
    type: 'hasPermission',
    server: request.server,
    auth: request.auth,
    permission: 'autoModeration.addRule.allow'
  });

  return reply(promise);
}

module.exports = {
  method: 'POST',
  path: '/api/automoderation/rules',
  config: {
    auth: { strategy: 'jwt' },
    validate: {
      payload: {
        name: Joi.string().max(255).required(),
        description: Joi.string().max(1000),
        message: Joi.string().max(1000),
        conditions: Joi.array().items(Joi.object().keys({
          param: Joi.string().trim().valid('body', 'thread_id', 'user_id', 'title').required(),
          regex: Joi.object().keys({
            pattern: Joi.string().max(255).required(),
            flags: Joi.string().trim().max(25).allow('')
          }).required()
        })).min(1).required(),
        actions: Joi.array().items(Joi.string().valid('reject', 'ban', 'edit', 'delete')).min(1).required(),
        options: {
          banInterval: Joi.number(),
          edit: {
            replace: {
              regex: Joi.object().keys({
                pattern: Joi.string().max(255).required(),
                flags: Joi.string().trim().max(25).allow('')
              }).required(),
              text: Joi.string().required()
            },
            template: Joi.string().regex(/{body}/)
          }
        }
      }
    },
    pre: [ { method: auth } ]
  },
  handler: function(request, reply) {
    var rule = request.payload;
    var promise = db.addRule(rule)
    .tap(function(rule) { autoModerator.addRule(rule); });
    return reply(promise);
  }
};
