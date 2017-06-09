var path = require('path');
var Boom = require('boom');
var crypto = require('crypto');
var Request = require('request');
var Promise = require('bluebird');

/**
  * @api {POST} /recover/ Recover Account
  * @apiName AccountRecoveryReq
  * @apiGroup Auth
  * @apiVersion 0.4.0
  * @apiDescription Used to recover an account by username or email. Sends an email with
  * a URL to visit to reset the user's account password.
  *
  * @apiParam (Payload) {string} query The email or username to attempt to recover
  * @apiParam (Payload) {string} recaptcha The recaptcha token
  *
  * @apiSuccess {object} success 200 OK
  *
  * @apiError (Error 400) BadRequest Recaptcha not submitted
  * @apiError (Error 400) BadRequest The username or email is not found
  * @apiError (Error 500) InternalServerError There was an error recovering the user's account
  */
module.exports = {
  method: 'POST',
  path: '/api/recover',
  config: {
    plugins: { backoff: true }
  },
  handler: function(request, reply) {
    var query = request.payload.query;
    var config = request.server.app.config;
    var recaptcha = request.payload.recaptcha;
    var secretKey = config.recaptchaSecretKey;
    var remoteAddress = request.info.remoteAddress;

    // validate the payload
    if (!recaptcha) {
      return reply(Boom.badRequest('Please click the checkbox'));
    }
    if (!query) {
      return reply(Boom.badRequest('Please enter a username or email'));
    }

    // setup reCaptcha url
    var urlBase = 'https://www.google.com/recaptcha/api/siteverify';
    var url = urlBase + `?secret=${secretKey}&response=${recaptcha}&remoteip=${remoteAddress}`;

    // check the captcha with google
    var promise =  new Promise(function(resolve, reject) {
      Request(url, (err, response, body) => {
        // parse body
        try { body = JSON.parse(body); }
        catch (e) { return reject(Boom.badRequest('Parsing Error on Recaptcha')); }

        // validate recaptcha validation response
        var error = 'Failed reCaptcha Check';
        if (err || response.statusCode !== 200) { return reject(Boom.badRequest(error)); }
        else if (!body.success) { return reject(Boom.badRequest(error)); }
        else if (body.success) { return resolve(); }
        else { return reject(Boom.badRequest(error)); }
      });
    })
    // get full user info
    .then(function() {
      return request.db.users.userByUsername(query)
      .then(function(user) {
        if (user) { return user; }
        else { return Promise.reject(Boom.badRequest('No Account Found')); }
      })
      .catch(function() { return request.db.users.userByEmail(query); })
      .then(function(user) {
        if (user) { return user; }
        else { return Promise.reject(Boom.badRequest('No Account Found')); }
      });
    })
    // Build updated user with resetToken and resetExpiration
    .then(function(user) {
      var updateUser = {};
      updateUser.reset_token = crypto.randomBytes(20).toString('hex');
      updateUser.reset_expiration = Date.now() + 1000 * 60 * 60; // 1 hr
      updateUser.id = user.id;
      // Store token and expiration to user object
      return request.db.users.update(updateUser);
    })
    // Email user reset information here
    .then(function(user) {
      var emailParams = {
        email: user.email,
        username: user.username,
        site_name: config.website.title,
        reset_url: config.publicUrl + '/' + path.join('reset', user.username, user.reset_token)
      };
      request.server.log('debug', emailParams);
      return request.emailer.send('recoverAccount', emailParams);
    })
    .error(request.errorMap.toHttpError);

    return reply(promise);
  }
};
