var Joi = require('joi');

exports.page = {
  auth: { strategy: 'jwt' },
  plugins: { acls: 'adminModerationLogs.page' },
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
    var promise = request.db.moderationLogs.page(request.query)
    .error(request.errorMap.toHttpError);

    return reply(promise);
  }
};
