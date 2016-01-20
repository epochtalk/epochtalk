var Joi = require('joi');
var path = require('path');
var db = require(path.normalize(__dirname + '/../../../db'));
var common = require(path.normalize(__dirname + '/../../common'));

exports.create = {
  auth: { strategy: 'jwt' },
  plugins: { acls: 'categories.create' },
  validate: { payload: { name: Joi.string().min(1).max(255).required() } },
  pre: [ { method: common.cleanCategory } ],
  handler: function(request, reply) {
    var promise = db.categories.create(request.payload);
    return reply(promise);
  }
};

exports.find = {
  auth: { strategy: 'jwt' },
  plugins: { acls: 'categories.find' },
  validate: { params: { id: Joi.string().required() } },
  handler: function(request, reply) {
    var promise = db.categories.find(request.params.id);
    return reply(promise);
  }
};

exports.all = {
  auth: { strategy: 'jwt' },
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
