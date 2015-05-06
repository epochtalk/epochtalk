var Joi = require('joi');
var path = require('path');
var Boom = require('boom');
var commonUsersPre = require(path.normalize(__dirname + '/../../common')).users;
var commonAdminPre = require(path.normalize(__dirname + '/../../common')).admin;
var pre = require(path.normalize(__dirname + '/pre'));
var db = require(path.normalize(__dirname + '/../../../../db'));

exports.update = {
  auth: { mode: 'required', strategy: 'jwt' },
  validate: {
    payload: Joi.object().keys({
      id: Joi.alternatives().try(Joi.string(), Joi.number()).required(),
      email: Joi.string().email(),
      username: Joi.string().min(1).max(255),
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
    .and('password', 'confirmation')
    .with('signature', 'raw_signature')
  },
  pre: [
    { method: commonAdminPre.adminCheck },
    [
      { method: pre.checkUserExists },
      { method: pre.checkUsernameUniqueness },
      { method: pre.checkEmailUniqueness }
    ],
    { method: commonUsersPre.clean },
    { method: commonUsersPre.parseSignature },
    { method: commonUsersPre.handleImages }
  ],
  handler: function(request, reply) {
    db.users.update(request.payload)
    .then(function(user) {
      delete user.confirmation_token;
      delete user.reset_token;
      delete user.reset_expiration;
      reply(user);
    })
    .catch(function(err) { reply(Boom.badImplementation(err)); });
  }
};

exports.find = {
  auth: { mode: 'required', strategy: 'jwt' },
  validate: { params: { username: Joi.string().required() } },
  pre: [ { method: commonAdminPre.adminCheck } ],
  handler: function(request, reply) {
    // get user by username
    var username = request.params.username;
    db.users.userByUsername(username)
    .then(function(user) {
      if (!user) { return Boom.badRequest('User doesn\'t exist.'); }
      delete user.passhash;
      delete user.confirmation_token;
      delete user.reset_token;
      return user;
    })
    .then(function(user) { reply(user); })
    .catch(function(err) { reply(Boom.badImplementation(err)); });
  }
};

exports.count = {
  auth: { mode: 'required', strategy: 'jwt' },
  pre: [ { method: commonAdminPre.adminCheck } ],
  handler: function(request, reply) {
    db.users.count()
    .then(function(usersCount) { reply(usersCount); });
  }
};

exports.countAdmins = {
  auth: { mode: 'required', strategy: 'jwt' },
  pre: [ { method: commonAdminPre.adminCheck } ],
  handler: function(request, reply) {
    db.users.countAdmins()
    .then(function(adminsCount) { reply(adminsCount); });
  }
};

exports.countModerators = {
  auth: { mode: 'required', strategy: 'jwt' },
  pre: [ { method: commonAdminPre.adminCheck } ],
  handler: function(request, reply) {
    db.users.countModerators()
    .then(function(moderatorsCount) { reply(moderatorsCount); });
  }
};

exports.page = {
  auth: { mode: 'required', strategy: 'jwt' },
  validate: {
    query: {
      page: Joi.number().integer().min(1).default(1),
      limit: Joi.number().integer().min(1).default(10),
      field: Joi.string().default('username').valid('username', 'email', 'updated_at', 'created_at', 'imported_at'),
      desc: Joi.boolean().default(false)
    }
  },
  pre: [ { method: commonAdminPre.adminCheck } ],
  handler: function(request, reply) {
    var opts = {
      limit: request.query.limit || 10,
      page: request.query.page || 1,
      sortField: request.query.field || 'username',
      sortDesc: request.query.desc || false
    };
    db.users.page(opts)
    .then(function(users) { reply(users); });
  }
};

exports.pageAdmins = {
  auth: { mode: 'required', strategy: 'jwt' },
  validate: {
    query: {
      page: Joi.number().integer().min(1).default(1),
      limit: Joi.number().integer().min(1).default(10),
      field: Joi.string().default('username').valid('username', 'email', 'updated_at', 'created_at', 'role'),
      desc: Joi.boolean().default(false)
    }
  },
  pre: [ { method: commonAdminPre.adminCheck } ],
  handler: function(request, reply) {
    var opts = {
      limit: request.query.limit || 10,
      page: request.query.page || 1,
      sortField: request.query.field || 'username',
      sortDesc: request.query.desc || false
    };
    db.users.pageAdmins(opts)
    .then(function(admins) { reply(admins); });
  }
};

exports.pageModerators = {
  auth: { mode: 'required', strategy: 'jwt' },
  validate: {
    query: {
      page: Joi.number().integer().min(1).default(1),
      limit: Joi.number().integer().min(1).default(10),
      field: Joi.string().default('username').valid('username', 'email', 'updated_at', 'created_at', 'role'),
      desc: Joi.boolean().default(false)
    }
  },
  pre: [ { method: commonAdminPre.adminCheck } ],
  handler: function(request, reply) {
    var opts = {
      limit: request.query.limit || 10,
      page: request.query.page || 1,
      sortField: request.query.field || 'username',
      sortDesc: request.query.desc || false
    };
    db.users.pageModerators(opts)
    .then(function(moderators) { reply(moderators); });
  }
};
