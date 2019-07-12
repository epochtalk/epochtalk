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
    permission: 'autoModeration.removeRule.allow'
  });

  return promise;
}

/**
  * @apiVersion 0.4.0
  * @apiGroup AutoModeration
  * @api {DELETE} /automoderation/rules/:id Remove Rule
  * @apiName RemoveRuleAutoModeration
  * @apiPermission Super Administrator, Administrator
  * @apiDescription Used to remove an existing auto moderation rule
  *
  * @apiParam {string} id The unique id of the rule to remove
  *
  * @apiSuccess {object} HTTP Code STATUS 200 OK
  *
  * @apiError (Error 500) InternalServerError There was an error removing the auto moderation rule
  */
module.exports = {
  method: 'DELETE',
  path: '/api/automoderation/rules/{id}',
  config: {
    auth: { strategy: 'jwt' },
    validate: { params: { id: Joi.string().required() } },
    pre: [ { method: auth } ]
  },
  handler: function(request, reply) {
    var ruleId = request.params.id;
    var promise = db.removeRule(ruleId)
    .tap(function() { autoModerator.removeRule(ruleId); })
    .error(request.errorMap.toHttpError);

    return promise;
  }
};
