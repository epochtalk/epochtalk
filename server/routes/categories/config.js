var Joi = require('joi');
var path = require('path');
var Hapi = require('hapi');
var Boom = require('boom');
var pre = require(path.normalize(__dirname + '/pre'));
var db = require(path.normalize(__dirname + '/../../../db'));

exports.create = {
  auth: { mode: 'required', strategy: 'jwt' },
  validate: { payload: { name: Joi.string().min(1).max(255).required() } },
  pre: [
    { method: pre.canCreate },
    { method: pre.clean }
  ],
  handler: function(request, reply) {
    var promise = db.categories.create(request.payload);
    return reply(promise);
  }
};

exports.import = {
  // validate: { payload: { name: Joi.string().min(1).max(255).required(), } },
  pre: [ { method: pre.clean } ],
  handler: function(request, reply) {
    var promise = db.categories.import(request.payload);
    return reply(promise);
  }
};

exports.find = {
  auth: { mode: 'try', strategy: 'jwt' },
  validate: { params: { id: Joi.string().required() } },
  handler: function(request, reply) {
    if (!request.server.methods.viewable(request)) { return reply({}); }

    var promise = db.categories.find(request.params.id);
    return reply(promise);
  }
};

exports.all = {
  auth: { mode: 'try', strategy: 'jwt' },
  handler: function(request, reply) {
    if (!request.server.methods.viewable(request)) { return reply([]); }

    return reply(db.categories.all());
  }
};

exports.delete = {
  auth: { strategy: 'jwt' },
  validate: { params: { id: Joi.string().required() } },
  pre: [ { method: pre.canDelete } ],
  handler: function(request, reply) {
    var promise = db.categories.delete(request.params.id);
    return reply(promise);
  }
};
