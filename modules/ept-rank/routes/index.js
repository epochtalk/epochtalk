var Joi = require('joi');

/**
  * @apiVersion 0.4.0
  * @apiGroup Rank
  * @api {POST} /rank Add Rank
  * @apiName AddRank
  * @apiPermission Super Administrator, Administrator
  * @apiDescription Used to add a new rank
  *
  * @apiParam (Payload) {string} rank_name The name of the rank to add
  * @apiParam (Payload) {number} threshold The threshold of the rank to add
  *
  * @apiSuccess {string} id The id of the added rank
  * @apiSuccess {string} rank_name The name of the added rank
  * @apiSuccess {number} threshold The threshold of the added rank
  *
  * @apiError (Error 500) InternalServerError There was an issue adding the rank
  */
var add = {
  method: 'POST',
  path: '/api/rank',
  config: {
    auth: { strategy: 'jwt' },
    validate: {
      payload: {
        rank_name: Joi.string().required(),
        threshold: Joi.number().required()
      }
    },
    pre: [ { method: 'auth.rank.add(server, auth)' } ]
  },
  handler: function(request, reply) {
    var data = request.payload;
    var promise = request.db.rank.add(data)
    .error(request.errorMap.toHttpError);
    return reply(promise);
  }
};

/**
  * @apiVersion 0.4.0
  * @apiGroup Rank
  * @api {PUT} /rank Update Rank
  * @apiName UpdateRank
  * @apiPermission Super Administrator, Administrator
  * @apiDescription Used to update a specific rank
  *
  * @apiParam (Payload) {string} id The id of the rank to updated
  * @apiParam (Payload) {string} rank_name The new name of the rank to updated
  * @apiParam (Payload) {number} threshold The new threshold of the rank to updated
  *
  * @apiSuccess {string} id The id of the updated rank
  * @apiSuccess {string} rank_name The name of the updated rank
  * @apiSuccess {number} threshold The threshold of the updated rank
  *
  * @apiError (Error 500) InternalServerError There was an issue updating the rank
  */
var update = {
  method: 'PUT',
  path: '/api/rank',
  config: {
    auth: { strategy: 'jwt' },
    validate: {
      payload: {
        id: Joi.string().required(),
        rank_name: Joi.string().required(),
        threshold: Joi.number().required()
      }
    },
    pre: [ { method: 'auth.rank.update(server, auth)' } ]
  },
  handler: function(request, reply) {
    var data = request.payload;
    var promise = request.db.rank.update(data)
    .error(request.errorMap.toHttpError);
    return reply(promise);
  }
};


/**
  * @apiVersion 0.4.0
  * @apiGroup Rank
  * @api {DELETE} /rank Delete Rank
  * @apiName DeleteRank
  * @apiPermission Super Administrator, Administrator
  * @apiDescription Used to delete a specific rank
  *
  * @apiParam (Query) {string} id The id of the rank to delete
  *
  * @apiSuccess {string} id The id of the deleted rank
  * @apiSuccess {string} rank_name The name of the deleted rank
  * @apiSuccess {number} threshold The threshold of the deleted rank
  *
  * @apiError (Error 500) InternalServerError There was an issue deleting the rank
  */
var remove = {
  method: 'DELETE',
  path: '/api/rank/{id}',
  config: {
    auth: { strategy: 'jwt' },
    // plugins: {
    //   mod_log: {
    //     type: 'rank.remove',
    //     data: {
    //       id: 'route.settings.plugins.mod_log.metadata.id',
    //       rank_name: 'route.settings.plugins.mod_log.metadata.rank_name',
    //       threshold: 'route.settings.plugins.mod_log.metadata.threshold',
    //     }
    //   }
    // },
    validate: { params: { id: Joi.string().required() } },
    pre: [ { method: 'auth.rank.remove(server, auth)' } ]
  },
  handler: function(request, reply) {
    var promise = request.db.rank.remove(request.params.id)
//    .then(function(removedRank) { request.route.settings.plugins.mod_log.metadata = removedRank; })
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
  * @apiDescription Used to retrieve a list of all ranks and their thresholds
  *
  * @apiSuccess {object[]} ranks Array containing all rank objects
  * @apiSuccess {string} ranks.id The id of the rank
  * @apiSuccess {string} ranks.rank_name The name of the rank
  * @apiSuccess {number} ranks.threshold The threshold of the rank
  *
  * @apiError (Error 500) InternalServerError There was an issue retrieving the list of ranks
  */
var get = {
  method: 'GET',
  path: '/api/rank',
  config: {
    auth: { strategy: 'jwt' },
    plugins: { track_ip: true },
    pre: [ { method: 'auth.rank.get(server, auth)' } ]
  },
  handler: function(request, reply) {
    var promise = request.db.rank.get()
    .error(request.errorMap.toHttpError);
    return reply(promise);
  }
};

module.exports = [ add, update, remove, get ];
