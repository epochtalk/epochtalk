var Joi = require('joi');

exports.addAddresses = {
  auth: { strategy: 'jwt' },
  plugins: { acls: 'adminBans.addAddresses' },
  validate: {
    payload: Joi.array(Joi.object().keys({
      hostname: Joi.string(),
      ip: Joi.string(),
      weight: Joi.number().required(),
      decay: Joi.boolean().default(false),
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

exports.editAddress = {
  auth: { strategy: 'jwt' },
  plugins: { acls: 'adminBans.editAddress' },
  validate: {
    payload: Joi.object().keys({
      hostname: Joi.string(),
      ip: Joi.string(),
      weight: Joi.number().required(),
      decay: Joi.boolean().default(false),
    }).without('hostname', 'ip')
  },
  handler: function(request, reply) {
    var address = request.payload;
    console.log(address);
    var promise =  request.db.bans.editAddress(address);
    return reply(promise);
  }
};

exports.deleteAddress = {
  auth: { strategy: 'jwt' },
  plugins: { acls: 'adminBans.deleteAddress' },
  validate: {
    query:{
      hostname: Joi.string(),
      ip: Joi.string()
    }
  },
  handler: function(request, reply) {
    var address = request.query;
    var promise =  request.db.bans.deleteAddress(address);
    return reply(promise);
  }
};
