var Joi = require('@hapi/joi');
var path = require('path');
var db = require(path.normalize(__dirname + '/../db'));
var autoModerator = require(path.normalize(__dirname + '/../autoModerator'));

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
  options: {
    auth: { strategy: 'jwt' },
    validate: { params: Joi.object({ id: Joi.string().required() }) },
    pre: [ { method: (request) => request.server.methods.auth.autoModeration.removeRule(request.server, request.auth) } ]
  },
  handler: function(request) {
    var ruleId = request.params.id;
    var promise = db.removeRule(ruleId)
    .tap(function() { autoModerator.removeRule(ruleId); })
    .error(request.errorMap.toHttpError);

    return promise;
  }
};
