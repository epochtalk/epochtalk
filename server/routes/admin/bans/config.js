var Joi = require('joi');

exports.getMaliciousScore = {
  handler: function(request, reply) {
    var ip = request.headers['x-forwarded-for'] || request.info.remoteAddress;
    var promise =  request.db.bans.getMaliciousScore(ip);
    return reply(promise);
  }
};

exports.addAddress = {
  auth: { strategy: 'jwt' },
  plugins: { acls: 'bans.addAddress' },
  validate: {
    payload: Joi.object().keys({
      hostname: Joi.string(),
      ip: Joi.string(),
      weight: Joi.number(),
      decay: Joi.boolean()
    }).without('hostname', 'ip')
  },
  handler: function(request, reply) {
    var promise =  request.db.bans.addAddress();
    return reply(promise);
  }
};
