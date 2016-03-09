var Joi = require('joi');
var Promise = require('bluebird');

exports.create = {
  auth: { strategy: 'jwt' },
  plugins: { acls: 'categories.create' },
  validate: {
    payload: Joi.array().items(Joi.object().keys({
      name: Joi.string().min(1).max(255).required()
    })).unique().min(1)
  },
  pre: [ { method: 'common.categories.clean(sanitizer, payload)' } ],
  handler: function(request, reply) {
    var promise = Promise.map(request.payload, function(cat) {
      return request.db.categories.create(cat);
    });

    return reply(promise);
  }
};

exports.find = {
  auth: { strategy: 'jwt' },
  plugins: { acls: 'categories.find' },
  validate: { params: { id: Joi.string().required() } },
  handler: function(request, reply) {
    var promise = request.db.categories.find(request.params.id);
    return reply(promise);
  }
};

exports.all = {
  auth: { strategy: 'jwt' },
  plugins: { acls: 'categories.all' },
  handler: function(request, reply) {
    return reply(request.db.categories.all());
  }
};

exports.delete = {
  auth: { strategy: 'jwt' },
  plugins: { acls: 'categories.delete' },
  validate: { payload: Joi.array().items(Joi.string().required()).unique().min(1) },
  handler: function(request, reply) {
    var promise = Promise.map(request.payload, function(catId) {
      return request.db.categories.delete(catId)
      .then(function() { return catId; });
    });

    return reply(promise);
  }
};
