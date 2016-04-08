var Joi = require('joi');

exports.addAddresses = {
  auth: { strategy: 'jwt' },
  plugins: { acls: 'adminBans.addAddresses' },
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

exports.pageBannedAddresses = {
  auth: { strategy: 'jwt' },
  plugins: { acls: 'adminBans.pageBannedAddresses' },
  validate: {
    query: {
      page: Joi.number().min(1),
      limit: Joi.number().min(1).max(100),
      desc: Joi.boolean().default(true),
      field: Joi.string().valid('created_at', 'updates', 'decay', 'weight', 'hostname', 'update_count'),
      search: Joi.string().optional()
    }
  },
  handler: function(request, reply) {
    var opts = request.query;
    var promise =  request.db.bans.pageBannedAddresses(opts);
    return reply(promise);
  }
};

