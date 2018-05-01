var Joi = require('joi');

/**
  * @apiVersion 0.4.0
  * @apiGroup Rank
  * @api {PUT} /rank Upsert Rank
  * @apiName UpsertRank
  * @apiPermission Super Administrator, Administrator
  * @apiDescription Used to insert/update ranks
  *
  * @apiParam (Payload) {object[]} ranks The id of the rank to updated
  * @apiParam (Payload) {string} ranks.name The name of the rank
  * @apiParam (Payload) {number} ranks.post_count The post count needed to achieve the rank
  *
  * @apiSuccess {object[]} ranks The id of the rank to updated
  * @apiSuccess {string} ranks.name The name of the rank
  * @apiSuccess {number} ranks.post_count The post count needed to achieve the rank
  *
  * @apiError (Error 500) InternalServerError There was an issue upserting the rank
  */
var upsert = {
  method: 'PUT',
  path: '/api/rank',
  config: {
    auth: { strategy: 'jwt' },
    validate: {
      payload: Joi.array().items(Joi.object().keys({
        name: Joi.string().max(255),
        post_count: Joi.number()
      })).unique('post_count')
    },
    pre: [ { method: 'auth.rank.upsert(server, auth)' } ]
  },
  handler: function(request, reply) {
    var ranks = request.payload;
    var promise = request.db.rank.upsert(ranks)
    .error(request.errorMap.toHttpError);
    return reply(promise);
  }
};


/**
  * @apiVersion 0.4.0
  * @apiGroup Rank
  * @api {GET} /rank Get Ranks
  * @apiName GetRanks
  * @apiPermission Super Administrator, Administrator
  * @apiDescription Used to retrieve a list of all ranks and their thresholds for use in the admin panel
  *
  * @apiSuccess {object[]} ranks The id of the rank to updated
  * @apiSuccess {string} ranks.name The name of the rank
  * @apiSuccess {number} ranks.post_count The post count needed to achieve the rank
  *
  * @apiError (Error 500) InternalServerError There was an issue retrieving the list of ranks
  */
var get = {
  method: 'GET',
  path: '/api/rank',
  config: {
    auth: { strategy: 'jwt' },
    pre: [ { method: 'auth.rank.get(server, auth)' } ]
  },
  handler: function(request, reply) {
    var promise = request.db.rank.get()
    .error(request.errorMap.toHttpError);
    return reply(promise);
  }
};

module.exports = [ upsert, get ];
