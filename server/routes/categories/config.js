var Joi = require('joi');
var path = require('path');
var pre = require(path.normalize(__dirname + '/pre'));
var db = require(path.normalize(__dirname + '/../../../db'));

exports.create = {
  auth: { mode: 'required', strategy: 'jwt' },
  plugins: { acls: 'categories.create' },
  validate: { payload: { name: Joi.string().min(1).max(255).required() } },
  pre: [ { method: pre.clean } ],
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
  plugins: { acls: 'categories.find' },
  validate: { params: { id: Joi.string().required() } },
  handler: function(request, reply) {
    var promise = db.categories.find(request.params.id);
    return reply(promise);
  }
};

exports.all = {
  auth: { mode: 'try', strategy: 'jwt' },
  plugins: { acls: 'categories.all' },
  handler: function(request, reply) {
    return reply(db.categories.all());
  }
};

exports.delete = {
  auth: { strategy: 'jwt' },
  plugins: { acls: 'categories.delete' },
  validate: { params: { id: Joi.string().required() } },
  handler: function(request, reply) {
    var promise = db.categories.delete(request.params.id);
    return reply(promise);
  }
};
