var Joi = require('joi');

exports.page = {
  auth: { strategy: 'jwt' },
  validate: {
    query: {
      page: Joi.number().integer().min(1).default(1),
      limit: Joi.number().integer().min(1).max(100).default(25),
      mod: Joi.string(),
      action: Joi.string(),
      keyword: Joi.string(),
      bdate: Joi.date(),
      adate: Joi.date(),
      sdate: Joi.date(),
      edate: Joi.date()
    }
  },
  handler: function(request, reply) {
    return reply(request.db.moderationLog.page(request.query));
  }
};
