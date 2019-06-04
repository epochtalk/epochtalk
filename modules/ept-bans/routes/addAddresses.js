var Joi = require('joi');

/**
  * @apiVersion 0.4.0
  * @apiGroup Bans
  * @api {POST} /ban/addresses (Admin) Add Ban Addresses
  * @apiName BanAddressesAdmin
  * @apiPermission Super Administrator, Administrator
  * @apiDescription This allows Administrators to ban hostnames and addresses. When a user
  * registers from a banned address, their account is automatically banned
  *
  * @apiParam (Payload) {object[]} data An array of addresses to ban
  * @apiParam (Payload) {string} data.hostname The hostname to ban. If hostname is present IP
  * should not be
  * @apiParam (Payload) {string} data.ip The IP address to ban. If IP is present hostname should
  * not be
  * @apiParam (Payload) {boolean} data.decay Boolean indicating if the weight decays or not
  * @apiParam (Payload) {number} data.weight The weight of the address
  *
  * @apiSuccess {object[]} data An array of banned addresses
  * @apiSuccess {string} data.hostname The banned hostname
  * @apiSuccess {string} data.ip The banned IP address
  * @apiSuccess {boolean} data.decay Boolean indicating if the weight decays or not
  * @apiSuccess {number} data.weight The weight of the address
  * @apiSuccess {string} data.created_at The created_at date of the banned address
  * @apiSuccess {string[]} data.updates An array of dates when the banned address was updated
  *
  * @apiError (Error 500) InternalServerError There was an error banning the addresses
  */
module.exports = {
  method: 'POST',
  path: '/api/ban/addresses',
  config: {
    auth: { strategy: 'jwt' },
    plugins: {
      mod_log: {
        type: 'bans.addAddresses',
        data: { addresses: 'payload' }
      }
    },
    validate: {
      payload: Joi.array().items(Joi.object().keys({
        hostname: Joi.string(),
        ip: Joi.string(),
        weight: Joi.number().required(),
        decay: Joi.boolean().default(false),
      }).without('hostname', 'ip'))
    },
    pre: [ { method: 'auth.bans.addAddresses(server, auth)' } ]
  },
  handler: function(request, reply) {
    var addresses = request.payload;
    var promise =  request.db.bans.addAddresses(addresses)
    .error(request.errorMap.toHttpError);

    return reply(promise);
  }
};
