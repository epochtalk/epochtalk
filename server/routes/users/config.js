var Joi = require('joi');
var path = require('path');
var Hapi = require('hapi');
var Boom = require('boom');
var bcrypt = require('bcrypt');
var pre = require(path.normalize(__dirname + '/pre'));
var db = require(path.normalize(__dirname + '/../../../db'));

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
    { method: pre.clean },
    { method: pre.parseSignature },
    { method: pre.handleImages },
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
    { method: pre.clean },
    { method: pre.parseSignature },
    { method: pre.handleImages },
  ],
  handler: function(request, reply) {
    var oldUser = request.pre.oldUser;
    request.payload.id = oldUser.id; // ensure modifying logged in user

    // check password
    var oldPass = request.payload.old_password;
    if (oldPass && !bcrypt.compareSync(oldPass, oldUser.passhash)) {
      return reply(Boom.badRequest('Old Password Invalid'));
    }

    // create the thread in db
    db.users.update(request.payload)
    .then(function(user) {
      delete user.confirmation_token;
      delete user.reset_token;
      delete user.reset_expiration;
      user.editable = true;
      reply(user);
    })
    .catch(function(err) { reply(Boom.badImplementation(err)); });
  }
};

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
      if (authUser.id !== user.id) { delete user.email; }
      if (authUser.id === user.id) { user.editable = true; }
      return user;
    })
    .then(function(user) { reply(user); })
    .catch(function(err) { reply(Boom.badImplementation(err)); });
  }
};

exports.all = {
  auth: { mode: 'try', strategy: 'jwt' },
  handler: function(request, reply) {
    if (!request.server.methods.viewable) { return reply([]); }
    // get logged in user
    var authUser = {};
    if (request.auth.isAuthenticated) {
      authUser = request.auth.credentials;
    }
    db.users.all()
    .then(function(users) {
      users.forEach(function(user) {
        delete user.passhash;
        delete user.confirmation_token;
        delete user.reset_token;
        if (authUser.id !== user.id) { delete user.email; }
      });
      return users;
    })
    .then(function(users) { reply(users); })
    .catch(function(err) { reply(Boom.badImplementation(err)); });
  }
};
