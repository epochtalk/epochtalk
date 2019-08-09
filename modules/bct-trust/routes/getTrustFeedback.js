var Joi = require('joi');
var Boom = require('boom');
var querystring = require('querystring');

/**
  * @apiVersion 0.4.0
  * @apiGroup Trust
  * @api {GET} /trustfeedback/:username Get Trust Feedback
  * @apiName GetTrustFeedback
  * @apiPermission User
  * @apiDescription Retrieve trust feedback for a user
  *
  * @apiParam (Payload) {string} username The username to get trust feedback for
  *
  * @apiSuccess {object[]} trusted An array of trusted feedback.
  * @apiSuccess {string} trusted.comments Trust feedback comments.
  * @apiSuccess {timestamp} trusted.created_at Timestamp of when feedback was left.
  * @apiSuccess {string} trusted.id Unique id of the trust feedback.
  * @apiSuccess {string} trusted.reference Refrence link for trust feedback.
  * @apiSuccess {object[]} trusted.reporter User info for user who left trust feedback.
  * @apiSuccess {string} trusted.reporter.id User id for user who left trust feedback.
  * @apiSuccess {string} trusted.reporter.username Username for user who left trust feedback.
  * @apiSuccess {object} trusted.reporter.stats User trust stats for user who left trust feedback.
  * @apiSuccess {number} trusted.reporter.stats.neg Negative trust review count.
  * @apiSuccess {number} trusted.reporter.stats.pos Positive trust review count.
  * @apiSuccess {number} trusted.reporter.stats.score Calculated trust score.
  * @apiSuccess {number} trusted.risked_btc Risked btc for feedback transaction.
  * @apiSuccess {boolean} trusted.scammer Type of feedback positive, negative, neutral.
  *
  * @apiSuccess {object[]} untrusted An array of untrusted feedback.
  * @apiSuccess {string} untrusted.comments Trust feedback comments.
  * @apiSuccess {timestamp} untrusted.created_at Timestamp of when feedback was left.
  * @apiSuccess {string} untrusted.id Unique id of the trust feedback.
  * @apiSuccess {string} untrusted.reference Refrence link for trust feedback.
  * @apiSuccess {object[]} untrusted.reporter User info for user who left trust feedback.
  * @apiSuccess {string} untrusted.reporter.id User id for user who left trust feedback.
  * @apiSuccess {string} untrusted.reporter.username Username for user who left trust feedback.
  * @apiSuccess {object} untrusted.reporter.stats User trust stats for user who left trust feedback.
  * @apiSuccess {number} untrusted.reporter.stats.neg Negative trust review count.
  * @apiSuccess {number} untrusted.reporter.stats.pos Positive trust review count.
  * @apiSuccess {number} untrusted.reporter.stats.score Calculated trust score.
  * @apiSuccess {number} untrusted.risked_btc Risked btc for feedback transaction.
  * @apiSuccess {boolean} untrusted.scammer Type of feedback positive, negative, neutral.
  *
  * @apiSuccess {object[]} sent An array of sent feedback.
  * @apiSuccess {string} sent.comments Trust feedback comments.
  * @apiSuccess {timestamp} sent.created_at Timestamp of when feedback was left.
  * @apiSuccess {string} sent.id Unique id of the trust feedback.
  * @apiSuccess {string} sent.reference Refrence link for trust feedback.
  * @apiSuccess {number} sent.risked_btc Risked btc for feedback transaction.
  * @apiSuccess {boolean} sent.scammer Type of feedback positive, negative, neutral.
  *
  * @apiError (Error 403) Forbidden User doesn't have permissions to get the default trust list.
  * @apiError (Error 500) InternalServerError There was an issue retrieving the default trust list.
  */
module.exports = {
  method: 'GET',
  path: '/api/trustfeedback/{username}',
  options: {
    auth: { strategy: 'jwt' },
    validate: { params: { username: Joi.string().min(1).required() } }
  },
  handler: function(request) {
    var username = querystring.unescape(request.params.username);
    var promise = request.db.users.userByUsername(username)
    .catch(function() { return Boom.notFound(); })
    .then(function(user) {
      return request.db.userTrust.getTrustFeedback(user.id, request.auth.credentials.id);
    })
    .error(request.errorMap.toHttpError);
    return promise;
  }
};
