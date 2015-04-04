var Joi = require('joi');
var path = require('path');
var Hapi = require('hapi');
var Boom = require('boom');
var bcrypt = require('bcrypt');
var pre = require(path.normalize(__dirname + '/pre'));
var db = require(path.normalize(__dirname + '/../../../db'));

// Route handlers/configs
exports.create = {
  validate: {
    payload: Joi.object().keys({
      email: Joi.string().email().required(),
      username: Joi.string().min(1).max(255).required(),
      password: Joi.string().min(8).max(72).required(),
      confirmation: Joi.ref('password')
    })
  },
  pre: [ { method: pre.clean } ],
  handler: function(request, reply) {
    db.users.create(request.payload)
    .then(function(user) {
      delete user.passhash;
      delete user.confirmation_token;
      reply(user);
    })
    .catch(function(err) { reply(Boom.badImplementation(err)); });
  }
};

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
      signature: Joi.string().allow(''),
      avatar: Joi.string().allow(''),
      status: Joi.string(),
      smf: Joi.object().keys({
        ID_MEMBER: Joi.number().required()
      })
    })
  },
  pre: [
    { method: pre.clean },
    { method: pre.parseSignature }
  ],
  handler: function(request, reply) {
    db.users.import(request.payload)
    .then(function(user) {
      delete user.passhash;
      delete user.confirmation_token;
      reply(user);
    })
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
      signature: Joi.string().allow(''),
      avatar: Joi.string().allow(''),
      reset_token: Joi.string(),
      reset_expiration: Joi.date(),
      confirmation_token: Joi.string().optional()
    })
  },
  pre: [
    [
      { method: pre.getCurrentUser, assign: 'currentUser' },
      { method: pre.checkUsernameUniqueness },
      { method: pre.checkEmailUniqueness }
    ],
    { method: pre.clean },
    { method: pre.parseSignature },
    { method: pre.removeImages },
  ],
  handler: function(request, reply) {
    // get user
    var user = request.pre.currentUser;

    // build the user object from payload and params
    var updateUser = { id: user.id };
    if (request.payload.username) {
      updateUser.username = request.payload.username;
    }
    if (request.payload.email) {
      updateUser.email = request.payload.email;
    }
    if (request.payload.old_password && request.payload.password && request.payload.confirmation) {
      if (bcrypt.compareSync(request.payload.old_password, user.passhash)) {
        updateUser.password = request.payload.password;
        updateUser.confirmation = request.payload.confirmation;
      }
      else { return reply(Boom.badRequest('Old Password Invalid')); }
    }
    else if (request.payload.password && request.payload.confirmation) {
      updateUser.password = request.payload.password;
      updateUser.confirmation = request.payload.confirmation;
    }
    if (request.payload.name || request.payload.name === '') {
      updateUser.name = request.payload.name;
    }
    if (request.payload.website || request.payload.website === '') {
      updateUser.website = request.payload.website;
    }
    if (request.payload.btcAddress || request.payload.btcAddress === '') {
      updateUser.btcAddress = request.payload.btcAddress;
    }

    if (request.payload.gender || request.payload.gender === '') {
      updateUser.gender = request.payload.gender;
    }
    if (request.payload.dob || request.payload.dob === '') {
      updateUser.dob = request.payload.dob;
    }
    if (request.payload.location || request.payload.location === '') {
      updateUser.location = request.payload.location;
    }
    if (request.payload.language || request.payload.language === '') {
      updateUser.language = request.payload.language;
    }
    if (request.payload.signature || request.payload.signature === '') {
      updateUser.signature = request.payload.signature;
    }
    if (request.payload.avatar || request.payload.avatar === '') {
      updateUser.avatar = request.payload.avatar;
    }
    if (request.payload.position || request.payload.position === '') {
      updateUser.position = request.payload.position;
    }

    // create the thread in db
    db.users.update(updateUser)
    .then(function(user) {
      delete user.passhash;
      delete user.confirmation_token;
      user.editable = true;
      reply(user);
    })
    .catch(function(err) { reply(Boom.badImplementation(err)); });
  }
};

exports.find = {
  auth: { mode: 'try', strategy: 'jwt' },
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
        if (authUser.id !== user.id) { delete user.email; }
      });
      return users;
    })
    .then(function(users) { reply(users); })
    .catch(function(err) { reply(Boom.badImplementation(err)); });
  }
};
