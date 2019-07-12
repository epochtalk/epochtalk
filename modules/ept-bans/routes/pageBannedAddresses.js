var Joi = require('joi');

/**
  * @apiVersion 0.4.0
  * @apiGroup Bans
  * @api {GET} /ban/addresses (Admin) Page by Banned Addresses
  * @apiName PageBannedAddressesAdmin
  * @apiPermission Super Administrator, Administrator
  * @apiDescription This allows Administrators to page through banned addresses.
  *
  * @apiParam (Query) {number{1..n}} [page=1] The page of results to return
  * @apiParam (Query) {number{1..100}} [limit=25] The number of results per page to return
  * @apiParam (Query) {string} [search] hostname or IP address to search for
  * @apiParam (Query) {boolean} [desc] boolean indicating whether or not to sort results in
  * descending order
  * @apiParam (Query) {string="created_at","updates","decay","weight", "update_count"} [field]
  * sorts results by specified field
  *
  * @apiSuccess {number} page The current page of results that is being returned
  * @apiSuccess {number} limit The current number of results that is being returned per page
  * @apiSuccess {boolean} next boolean indicating if there is a next page
  * @apiSuccess {boolean} prev boolean indicating if there is a previous page
  * @apiSuccess {string} search The search text that the results are being filtered by
  * @apiSuccess {boolean} desc boolean indicating if the results are in descending order
  * @apiSuccess {string} field field results are being sorted by
  * @apiSuccess {object[]} data An array of banned addresses
  * @apiSuccess {string} data.hostname The banned hostname
  * @apiSuccess {string} data.ip The banned IP address
  * @apiSuccess {boolean} data.decay Boolean indicating if the weight decays or not
  * @apiSuccess {number} data.weight The weight of the address
  * @apiSuccess {string} data.created_at The created_at date of the banned address
  * @apiSuccess {string} data.updated_at The most reason updated date of the banned address
  * @apiSuccess {string[]} data.updates An array of dates when the banned address was updated
  * @apiSuccess {number} data.update_count The number of times the banned address has been updated
  *
  * @apiError (Error 500) InternalServerError There was an error paging banned addresses
  * @apiError (Error 403) Forbidden User doesn't have permission to query banned addresses
  */
module.exports = {
  method: 'GET',
  path: '/api/ban/addresses',
  config: {
    auth: { strategy: 'jwt' },
    validate: {
      query: {
        page: Joi.number().min(1),
        limit: Joi.number().min(1).max(100),
        desc: Joi.boolean().default(true),
        field: Joi.string().valid('created_at', 'updates', 'decay', 'weight', 'update_count', 'imported_at'),
        search: Joi.string().optional()
      }
    },
    pre: [ { method: (request) => request.server.methods.auth.bans.pageBannedAddresses(request.server, request.auth) } ]
  },
  handler: function(request, reply) {
    var opts = request.query;
    var promise = request.db.bans.pageBannedAddresses(opts)
    .error(request.errorMap.toHttpError);

    return reply(promise);
  }
};
