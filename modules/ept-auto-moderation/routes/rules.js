var path = require('path');
var Boom = require('boom');
var db = require(path.normalize(__dirname + '/../db'));

// Auth Function
function auth(request, reply) {
  var promise = request.server.authorization.build({
    error: Boom.forbidden(),
    type: 'hasPermission',
    server: request.server,
    auth: request.auth,
    permission: 'autoModeration.rules.allow'
  });

  return promise;
}

/**
  * @apiVersion 0.4.0
  * @apiGroup AutoModeration
  * @api {GET} /automoderation/rules View Rules
  * @apiName ViewRulesAutoModeration
  * @apiPermission Super Administrator, Administrator
  * @apiDescription Returns auto moderation rules
  *
  * @apiSuccess {object[]} rules An array of auto moderation rules
  * @apiSuccess {string} rules.id The id of the auto moderation rule
  * @apiSuccess {string} rules.name The name of the auto moderation rule
  * @apiSuccess {string} rules.description The description of what the rule does
  * @apiSuccess {string} rules.message The error message which is returned to the user
  * @apiSuccess {object[]} rules.conditions What conditions trigger the rule
  * @apiSuccess {string="body","thread_id","user_id","title"} rules.conditions.params The parameter that triggers the rule
  * @apiSuccess {object} rules.conditions.regex A regex used to capture user input and trigger rule
  * @apiSuccess {string} rules.conditions.regex.pattern The regex pattern
  * @apiSuccess {string} rules.conditions.regex.flags The regex flags
  * @apiSuccess {string[]="reject","ban","edit","delete"} rules.actions Array containing what action is taken when the rule is matched
  * @apiSuccess {object} rules.options Contains settings related to the action that is taken
  * @apiSuccess {number} rules.options.ban_interval How many days to ban the user for, leave blank for permanent ban
  * @apiSuccess {object} rules.options.edit Contains information for replacing matched rule text
  * @apiSuccess {object} rules.options.edit.replace Contains info for what text to replace
  * @apiSuccess {object} rules.options.edit.replace.regex Regex to match text to replace
  * @apiSuccess {string} rules.options.edit.replace.regex.pattern The regex pattern
  * @apiSuccess {string} rules.options.edit.replace.regex.flags The regex flags
  * @apiSuccess {string} rules.options.edit.replace.text The text to replaced the matched text with
  * @apiSuccess {string} rules.options.edit.template Allows message to be replaced, prepended, or appended to
  *
  * @apiError (Error 500) InternalServerError There was an error viewing the auto moderation rules
  */
module.exports = {
  method: 'GET',
  path: '/api/automoderation/rules',
  config: {
    auth: { strategy: 'jwt' },
    pre: [ { method: auth } ]
  },
  handler: function(request, reply) {
    var promise = db.rules()
    .error(request.errorMap.toHttpError);

    return promise;
  }
};
