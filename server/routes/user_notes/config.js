var Joi = require('joi');
var Promise = require('bluebird');

exports.page = {
//  auth: { strategy: 'jwt' },
//  plugins: { acls: 'userNotes.page' },
  validate: {
    query: {
      user_id: Joi.string().required(),
      page: Joi.number().min(1),
      limit: Joi.number().min(1).max(100)
    }
  },
  handler: function(request, reply) {
    var opts = request.query;
    var promise =  request.db.userNotes.page(opts);
    return reply(promise);
  }
};

exports.find = {
//  auth: { strategy: 'jwt' },
//  plugins: { acls: 'userNotes.page' },
  validate: { params: { id: Joi.string().required() } },
  handler: function(request, reply) {
    var id = request.params.id;
    var promise =  request.db.userNotes.find(id);
    return reply(promise);
  }
};

exports.create = {
//  auth: { strategy: 'jwt' },
//  plugins: { acls: 'userNotes.page' },
  validate: {
    payload: {
      user_id: Joi.string().required(),
      author_id: Joi.string().required(),
      note: Joi.string().min(2).max(2000).required()
    }
  },
  handler: function(request, reply) {
    var opts = request.payload;
    var promise =  request.db.userNotes.create(opts);
    return reply(promise);
  }
};

exports.update = {
//  auth: { strategy: 'jwt' },
//  plugins: { acls: 'userNotes.page' },
  validate: {
    payload: {
      id: Joi.string().required(),
      note: Joi.string().min(2).max(2000).required()
    }
  },
  handler: function(request, reply) {
    var opts = request.payload;
    var promise =  request.db.userNotes.update(opts);
    return reply(promise);
  }
};

exports.delete = {
//  auth: { strategy: 'jwt' },
//  plugins: { acls: 'userNotes.page' },
  validate: { query: { id: Joi.string().required() } },
  handler: function(request, reply) {
    var id = request.query.id;
    var promise =  request.db.userNotes.delete(id);
    return reply(promise);
  }
};
