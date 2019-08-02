var Joi = require('joi');

/**
  * @apiVersion 0.4.0
  * @apiGroup Bans
  * @api {PUT} /ban/addresses (Admin) Edit Ban Address
  * @apiName EditBannedAddressAdmin
  * @apiPermission Super Administrator, Administrator
  * @apiDescription This allows Administrators to edit banned hostnames and addresses.
  *
  * @apiParam (Payload) {string} hostname The hostname to update. If hostname is present IP should
  * not be.
  * @apiParam (Payload) {string} ip The IP address to update. If IP is present hostname should not
  * be.
  * @apiParam (Payload) {boolean} decay The updated boolean indicating if the weight decays
  * or not.
  * @apiParam (Payload) {number} weight The updated weight of the address
  *
  * @apiSuccess {string} hostname The updated banned hostname
  * @apiSuccess {string} ip The updated banned IP address
  * @apiSuccess {boolean} decay The updated boolean indicating if the weight decays or not
  * @apiSuccess {number} weight The updated weight of the address
  * @apiSuccess {string} created_at The created_at date of the banned address
  * @apiSuccess {string[]} updates An array of dates when the banned address was updated
  *
  * @apiError (Error 500) InternalServerError There was an error updating the banned address
  */
module.exports = {
  method: 'PUT',
  path: '/api/ban/addresses',
  options: {
    auth: { strategy: 'jwt' },
    plugins: {
      mod_log: {
        type: 'bans.editAddress',
        data: {
          hostname: 'payload.hostname',
          ip: 'payload.ip',
          weight: 'payload.weight',
          decay: 'payload.decay'
        }
      }
    },
    validate: {
      payload: Joi.object().keys({
        hostname: Joi.string(),
        ip: Joi.string(),
        weight: Joi.number().required(),
        decay: Joi.boolean().default(false),
      }).without('hostname', 'ip')
    },
    pre: [ { method: (request) => request.server.methods.auth.bans.editAddress(request.server, request.auth) } ]
  },
  handler: function(request) {
    var address = request.payload;
    var promise =  request.db.bans.editAddress(address)
    .error(request.errorMap.toHttpError);

    return promise;
  }
};
