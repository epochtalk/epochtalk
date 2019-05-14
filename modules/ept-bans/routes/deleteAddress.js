var Joi = require('joi');

/**
  * @apiVersion 0.4.0
  * @apiGroup Bans
  * @api {DELETE} /ban/addresses (Admin) Delete Ban Address
  * @apiName DeleteBannedAddressAdmin
  * @apiPermission Super Administrator, Administrator
  * @apiDescription This allows Administrators to delete banned hostnames and addresses.
  *
  * @apiParam (Query) {string} hostname The hostname to delete. If hostname is present IP should
  * not be.
  * @apiParam (Query) {string} ip The IP address to delete. If IP is present hostname should not
  * be.
  *
  * @apiSuccess {string} hostname The deleted banned hostname
  * @apiSuccess {string} ip The deleted banned IP address
  * @apiSuccess {boolean} decay The deleted boolean indicating if the weight decays or not
  * @apiSuccess {number} weight The deleted weight of the address
  * @apiSuccess {string} created_at The created_at date of the deleted banned address
  * @apiSuccess {string[]} updates An array of dates when the deleted banned address was updated
  *
  * @apiError (Error 500) InternalServerError There was an error deleting the banned address
  */
module.exports = {
  method: 'DELETE',
  path: '/api/ban/addresses',
  config: {
    auth: { strategy: 'jwt' },
    plugins: {
      acls: 'bans.deleteAddress',
      mod_log: {
        type: 'bans.deleteAddress',
        data: {
          hostname: 'query.hostname',
          ip: 'query.ip'
        }
      }
    },
    validate: {
      query:{
        hostname: Joi.string(),
        ip: Joi.string()
      }
    }
  },
  handler: function(request, reply) {
    var address = request.query;
    var promise =  request.db.bans.deleteAddress(address)
    .error(request.errorMap.toHttpError);

    return reply(promise);
  }
};
