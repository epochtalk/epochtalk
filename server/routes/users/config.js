var Joi = require('joi');
var _ = require('lodash');
var path = require('path');
var querystring = require('querystring');
var common = require(path.normalize(__dirname + '/../../common'));
var authHelper = require(path.normalize(__dirname + '/../auth/helper'));

/**
  * @apiVersion 0.4.0
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
  plugins: { acls: 'users.update' },
  validate: {
    payload: Joi.object().keys({
      id: Joi.string().required(),
      email: Joi.string().email(),
      username: Joi.string().regex(/^[a-zA-Z\d-_.]+$/).min(3).max(255).required(),
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
    // TODO: password should be needed to update email
    [ { method: 'auth.users.update(server, auth, payload)' } ],
    { method: common.cleanUser },
    { method: common.parseSignature },
    { method: common.handleSignatureImages },
  ],
  handler: function(request, reply) {
    // set editing user to current user
    request.payload.id = request.auth.credentials.id;

    // update the user in db
    var promise = request.db.users.update(request.payload)
    .then(function(user) {
      delete user.confirmation_token;
      delete user.reset_token;
      delete user.reset_expiration;
      delete user.old_password;
      delete user.password;
      delete user.confirmation;
      return user;
    })
    .then(function(user) {
      return authHelper.updateUserInfo(user)
      .then(function() { return user; });
    });

    return reply(promise);
  }
};

/**
  * @apiVersion 0.4.0
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
  plugins: { acls: 'users.find' },
  validate: { params: { username: Joi.string().required() } },
  pre: [ { method: 'auth.users.find(server, auth, params)' } ],
  handler: function(request, reply) {
    // get logged in user id
    var userId = '';
    var authenticated = request.auth.isAuthenticated;
    if (authenticated) { userId = request.auth.credentials.id; }

    // get user by username
    var username = querystring.unescape(request.params.username);
    var promise = request.db.users.userByUsername(username)
    .then(function(user) {
      delete user.passhash;
      delete user.confirmation_token;
      delete user.reset_token;
      delete user.reset_expiration;
      if (userId !== user.id) { delete user.email; }
      user.priority = _.min(user.roles.map(function(role) { return role.priority; }));
      user.roles = user.roles.map(function(role) { return role.lookup; });
      return user;
    });

    return reply(promise);
  }
};

/**
  * @apiVersion 0.4.0
  * @apiGroup Users
  * @api {POST} /users/:userId/deactivate Deactivate
  * @apiName DeactivateUser
  * @apiDescription Deactivate a user by userId
  *
  * @apiParam {string} id The userId of the user to deactivate
  *
  * @apiSuccess {object} STATUS 200 OK
  *
  * @apiError (Error 500) InternalServerError There was an error deactivating the user
  */
exports.deactivate = {
  app: { user_id: 'params.id' },
  auth: { strategy: 'jwt' },
  plugins: { acls: 'users.deactivate' },
  validate: { params: { id: Joi.string().required() } },
  pre: [ { method: 'auth.users.deactivate(server, auth, params.id)' } ],
  handler: function(request, reply) {
    var userId = request.params.id;
    var promise = request.db.users.deactivate(userId);
    return reply(promise);
  }
};

/**
  * @apiVersion 0.4.0
  * @apiGroup Users
  * @api {POST} /users/:userId/reactivate Reactivate
  * @apiName ReactivateUser
  * @apiDescription Reactivate a user by userId
  *
  * @apiParam {string} id The userId of the user to reactivate
  *
  * @apiSuccess {object} STATUS 200 OK
  *
  * @apiError (Error 500) InternalServerError There was an error reactivating the user
  */
exports.reactivate = {
  app: { user_id: 'params.id' },
  auth: { strategy: 'jwt' },
  plugins: { acls: 'users.reactivate' },
  validate: { params: { id: Joi.string().required() } },
  pre: [ { method: 'auth.users.activate(server, auth, params.id)' } ],
  handler: function(request, reply) {
    var userId = request.params.id;
    var promise = request.db.users.reactivate(userId);
    return reply(promise);
  }
};

/**
  * @apiVersion 0.4.0
  * @apiGroup Users
  * @api {DELETE} /users/:userId Delete
  * @apiName DeleteUser
  * @apiDescription Delete a user by userId
  *
  * @apiParam {string} id The userId of the user to delete
  *
  * @apiSuccess {object} STATUS 200 OK
  *
  * @apiError (Error 500) InternalServerError There was an error deleteing the user
  */
exports.delete = {
  auth: { strategy: 'jwt' },
  plugins: { acls: 'users.delete' },
  validate: { params: { id: Joi.string().required() } },
  handler: function(request, reply) {
    var userId = request.params.id;
    var promise = request.db.users.delete(userId);
    return reply(promise);
  }
};
