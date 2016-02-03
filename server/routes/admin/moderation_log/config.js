var Joi = require('joi');
var path = require('path');
var Promise = require('bluebird');
var authorization = require(path.normalize(__dirname + '/../../../authorization'));

exports.page = {
  auth: { strategy: 'jwt' },
  validate: {
    query: {
      page: Joi.number().integer().min(1).default(1),
      limit: Joi.number().integer().min(1).max(100).default(15),
      filterCol: Joi.string().valid('mod_username', 'mod_id', 'mod_ip', 'action_api_url', 'action_api_method', 'action_taken_at', 'action_type'),
      filter: Joi.string()
    }
  },
  handler: function(request, reply) {
    return reply(request.db.moderationLog.page(request.query));
  }
};
