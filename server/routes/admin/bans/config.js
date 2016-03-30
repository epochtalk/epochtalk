var Joi = require('joi');

exports.getMaliciousScore = {
  handler: function(request, reply) {
    var ip = request.headers['x-forwarded-for'] || request.info.remoteAddress;
    var promise =  request.db.bans.getMaliciousScore(ip);
    return reply(promise);
  }
};

exports.addAddresses = {
  auth: { strategy: 'jwt' },
//  plugins: { acls: 'bans.addAddresses' },
  validate: {
    payload: Joi.array(Joi.object().keys({
      hostname: Joi.string(),
      ip: Joi.string(),
      weight: Joi.number().required(),
      decay: Joi.boolean()
    }).without('hostname', 'ip'))
  },
  handler: function(request, reply) {
    var addresses = request.payload;
    var promise =  request.db.bans.addAddresses(addresses);
    return reply(promise);
  }
};
