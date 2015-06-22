var Joi = require('joi');
var path = require('path');
var Boom = require('boom');
var bcrypt = require('bcrypt');
var commonPre = require(path.normalize(__dirname + '/../common')).users;
var pre = require(path.normalize(__dirname + '/pre'));
var db = require(path.normalize(__dirname + '/../../../db'));

/**
  * @apiVersion 0.3.0
  * @apiGroup Users
  * @api {POST} /users/import Import
  * @apiName ImportUser
  * @apiPermission Super Administrator
  * @apiDescription Import a user from an existing forum. Currently only SMF is supported
  *
  * @apiParam (Payload) {string} username The user's username
  * @apiParam (Payload) {string} [email] The user's email
  * @apiParam (Payload) {string} [name] The user's name
  * @apiParam (Payload) {string} [website] URL to user's website
  * @apiParam (Payload) {string} [btcAddress] User's bitcoin wallet address
  * @apiParam (Payload) {string} [gender] The user's gender
  * @apiParam (Payload) {string} [dob] String version of the user's dob
  * @apiParam (Payload) {string} [location] The user's geographical location
  * @apiParam (Payload) {string} [language] The user's native language
  * @apiParam (Payload) {string} [position] The user's position title
  * @apiParam (Payload) {string} [raw_signature] The user's signature as it was entered in the editor by the user
  * @apiParam (Payload) {string} [avatar] URL to the user's avatar
  * @apiParam (Payload) {date} created_at Date that the user's account was created
  * @apiParam (Payload) {date} updated_at Date that the user's account was last updated
  * @apiParam (Payload) {object} smf Object containing the user's legacy SMF data
  * @apiParam (Payload) {number} smf.ID_MEMBER The user's legacy smf id
  *
  * @apiSuccess {string} id The user's unique id
  * @apiSuccess {string} username The user's username
  * @apiSuccess {string} [email] The user's email
  * @apiSuccess {string} [name] The user's name
  * @apiSuccess {string} [website] URL to user's website
  * @apiSuccess {string} [btcAddress] User's bitcoin wallet address
  * @apiSuccess {string} [gender] The user's gender
  * @apiSuccess {timestamp} [dob] Timestamp of the user's dob
  * @apiSuccess {string} [location] The user's geographical location
  * @apiSuccess {string} [language] The user's native language
  * @apiSuccess {string} [position] The user's position title
  * @apiSuccess {string} [raw_signature] The user's signature as it was entered in the editor by the user
  * @apiSuccess {string} [avatar] URL to the user's avatar
  * @apiSuccess {timestamp} created_at Timestamp of when the user's account was created
  * @apiSuccess {timestamp} updated_at Timestamp of when the user's account was last updated
  * @apiSuccess {object} smf Object containing the user's legacy SMF data
  * @apiSuccess {number} smf.ID_MEMBER The user's legacy smf id
  *
  * @apiError (Error 500) InternalServerError There was error importing the user
  */
exports.import = {
  // auth: { strategy: 'jwt' },
  validate: {
    payload: Joi.object().keys({
      username: Joi.string().required(),
      email: Joi.string(), // should be required?
      created_at: Joi.date(),
      updated_at: Joi.date(),
      name: Joi.string().allow(''),
      website: Joi.string().allow(''),
      btcAddress: Joi.string().allow(''),
      gender: Joi.string().allow(''),
      dob: Joi.string().allow(''),
      location: Joi.string().allow(''),
      language: Joi.string(),
      position: Joi.string(),
      raw_signature: Joi.string().allow(''),
      avatar: Joi.string().allow(''),
      status: Joi.string(),
      smf: Joi.object().keys({
        ID_MEMBER: Joi.number().required()
      })
    })
  },
  pre: [
    { method: commonPre.clean },
    { method: commonPre.parseSignature },
    { method: commonPre.handleImages },
  ],
  handler: function(request, reply) {
    db.users.import(request.payload)
    .then(function(user) { reply(user); })
    .catch(function(err) {
      request.log('error', 'Import board: ' + JSON.stringify(err, ['stack', 'message'], 2));
      reply(Boom.badImplementation(err));
    });
  }
};

/**
  * @apiVersion 0.3.0
  * @apiGroup Users
  * @api {PUT} /users Update
  * @apiName UpdateUser
  * @apiPermission User (Users may update their own account)
  * @apiDescription Used to update user information such as profile fields, or passwords.
  *
  * @apiParam (Payload) {string} id The user's unique id
  * @apiParam (Payload) {string} [username] The user's username
  * @apiParam (Payload) {string} [email] The user's email
  * @apiParam (Payload) {string} [old_password] The user's old password (used for changing password)
  * @apiParam (Payload) {string} [password] The user's new passowrd (used for changing password)
  * @apiParam (Payload) {string} [confirmation] The user's new password confirmation (used for changing password)
  * @apiParam (Payload) {string} [name] The user's name
  * @apiParam (Payload) {string} [website] URL to user's website
  * @apiParam (Payload) {string} [btcAddress] User's bitcoin wallet address
  * @apiParam (Payload) {string} [gender] The user's gender
  * @apiParam (Payload) {date} [dob] Date version of the user's dob
  * @apiParam (Payload) {string} [location] The user's geographical location
  * @apiParam (Payload) {string} [language] The user's native language
  * @apiParam (Payload) {string} [position] The user's position title
  * @apiParam (Payload) {string} [raw_signature] The user's signature as it was entered in the editor by the user
  * @apiParam (Payload) {string} [signature] The user's signature with any markup tags converted and parsed into html elements
  * @apiParam (Payload) {string} [avatar] URL to the user's avatar
  *
  * @apiSuccess {string} id The user's unique id
  * @apiSuccess {string} [username] The user's username
  * @apiSuccess {string} [email] The user's email
  * @apiSuccess {string} [name] The user's name
  * @apiSuccess {string} [website] URL to user's website
  * @apiSuccess {string} [btcAddress] User's bitcoin wallet address
  * @apiSuccess {string} [gender] The user's gender
  * @apiSuccess {timestamp} [dob] Timestamp of the user's dob
  * @apiSuccess {string} [location] The user's geographical location
  * @apiSuccess {string} [language] The user's native language
  * @apiSuccess {string} [position] The user's position title
  * @apiSuccess {string} [raw_signature] The user's signature as it was entered in the editor by the user
  * @apiSuccess {string} [signature] The user's signature with any markup tags converted and parsed into html elements
  * @apiSuccess {string} [avatar] URL to the user's avatar
  *
  * @apiError BadRequest Occurs when resetting password and an invalid old password is provided
  * @apiError (Error 500) InternalServerError There was error updating the user
  */
exports.update = {
  auth: { strategy: 'jwt' },
  validate: {
    payload: Joi.object().keys({
      id: Joi.alternatives().try(Joi.string(), Joi.number()).required(),
      email: Joi.string().email(),
      username: Joi.string().min(1).max(255),
      old_password: Joi.string().min(8).max(72),
      password: Joi.string().min(8).max(72),
      confirmation: Joi.ref('password'),
      name: Joi.string().allow(''),
      website: Joi.string().allow(''),
      btcAddress: Joi.string().allow(''),
      gender: Joi.string().allow(''),
      dob: Joi.date().allow(''),
      location: Joi.string().allow(''),
      language: Joi.string().allow(''),
      position: Joi.string().allow(''),
      raw_signature: Joi.string().allow(''),
      signature: Joi.string().allow(''),
      avatar: Joi.string().allow('')
    })
    .and('old_password', 'password', 'confirmation')
    .with('signature', 'raw_signature')
  },
  pre: [
    [
      { method: pre.getCurrentUser, assign: 'oldUser' },
      { method: pre.checkUsernameUniqueness },
      { method: pre.checkEmailUniqueness }
    ],
    { method: commonPre.clean },
    { method: commonPre.parseSignature },
    { method: commonPre.handleImages },
  ],
  handler: function(request, reply) {
    var oldUser = request.pre.oldUser;
    request.payload.id = oldUser.id; // ensure modifying logged in user

    // check password
    var oldPass = request.payload.old_password;
    if (oldPass && !bcrypt.compareSync(oldPass, oldUser.passhash)) {
      return reply(Boom.badRequest('Old Password Invalid'));
    }

    // update the user in db
    db.users.update(request.payload)
    .then(function(user) {
      delete user.confirmation_token;
      delete user.reset_token;
      delete user.reset_expiration;
      delete user.old_password;
      delete user.password;
      delete user.confirmation;
      reply(user);
    })
    .catch(function(err) { reply(Boom.badImplementation(err)); });
  }
};

/**
  * @apiVersion 0.3.0
  * @apiGroup Users
  * @api {GET} /users/:username Find
  * @apiName FindUser
  * @apiDescription Find a user by their username.
  *
  * @apiParam {string} username The username of the user to find
  *
  * @apiSuccess {string} id The user's unique id
  * @apiSuccess {string} username The user's username
  * @apiSuccess {string} avatar URL to the user's avatar image
  * @apiSuccess {string} signature The user's signature with any markup tags converted and parsed into html elements
  * @apiSuccess {string} raw_signature The user's signature as it was entered in the editor by the user
  * @apiSuccess {number} post_count The number of posts made by this user
  * @apiSuccess {string} name The user's actual name (e.g. John Doe)
  * @apiSuccess {string} website URL to the user's website
  * @apiSuccess {string} gender The user's gender
  * @apiSuccess {timestamp} dob The user's date of birth
  * @apiSuccess {string} location The user's location
  * @apiSuccess {string} language The user's native language (e.g. English)
  * @apiSuccess {timestamp} created_at Timestamp of when the user's account was created
  * @apiSuccess {timestamp} updated_at Timestamp of when the user's account was last updated
  * @apiSuccess {object[]} roles An array containing the users role objects
  * @apiSuccess {string} roles.id The unique id of the role
  * @apiSuccess {string} roles.name The name of the role
  * @apiSuccess {string} roles.description The description of the role
  * @apiSuccess {object} roles.permissions The permissions that this role has
  * @apiSuccess {timestamp} roles.created_at Timestamp of when the role was created
  * @apiSuccess {timestamp} roles.updated_at Timestamp of when the role was last updated
  *
  * @apiError BadRequest The user doesn't exist
  * @apiError (Error 500) InternalServerError There was error looking up the user
  */
exports.find = {
  auth: { mode: 'try', strategy: 'jwt' },
  validate: { params: { id: Joi.string().required() } },
  handler: function(request, reply) {
    if (!request.server.methods.viewable) { return reply({}); }
    // get logged in user
    var authUser = {};
    if (request.auth.isAuthenticated) {
      authUser = request.auth.credentials;
    }
    // get user by username
    var username = request.params.id;
    db.users.userByUsername(username)
    .then(function(user) {
      if (!user) { return Boom.badRequest('User doesn\'t exist.'); }
      delete user.passhash;
      delete user.confirmation_token;
      delete user.reset_token;
      delete user.reset_expiration;
      if (authUser.id !== user.id) { delete user.email; }
      return user;
    })
    .then(function(user) { reply(user); })
    .catch(function(err) { reply(Boom.badImplementation(err)); });
  }
};
