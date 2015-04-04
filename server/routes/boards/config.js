var Joi = require('joi');
var path = require('path');
var Hapi = require('hapi');
var Boom = require('boom');
var pre = require(path.normalize(__dirname + '/pre'));
var db = require(path.normalize(__dirname + '/../../../db'));


exports.create = {
  auth: { mode: 'required', strategy: 'jwt' },
  validate: {
    payload: {
      name: Joi.string().min(1).max(255).required(),
      description: Joi.string().allow(''),
      category_id: [ Joi.string(), Joi.number() ],
      parent_id: [ Joi.string(), Joi.number() ],
      children_ids: [ Joi.array(Joi.string()), Joi.array(Joi.number()) ]
    }
  },
  pre: [
    { method: pre.clean },
    { method: pre.adminCheck }
  ],
  handler: function(request, reply) {
    db.boards.create(request.payload)
    .then(function(board) { reply(board); })
    .catch(function(err) { reply(Boom.badImplementation(err)); });
  }
};

exports.import = {
  // validate: {
  //   payload: {
  //     name: Joi.string().required(),
  //     description: Joi.string(),
  //     category_id: [ Joi.string(), Joi.number() ],
  //     created_at: Joi.date(),
  //     updated_at: Joi.date(),
  //     parent_id: [ Joi.string(), Joi.number() ],
  //     children_ids: [ Joi.array(Joi.string()), Joi.array(Joi.number()) ],
  //     deleted: Joi.boolean(),
  //     smf: Joi.object().keys({
  //       ID_BOARD: Joi.number(),
  //       ID_PARENT: Joi.number()
  //     })
  //   }
  // },
  pre: [ { method: pre.clean } ],
  handler: function(request, reply) {
    db.boards.import(request.payload)
    .then(function(board) { reply(board); })
    .catch(function(err) {
      request.log('error', 'Import board: ' + JSON.stringify(err, ['stack', 'message'], 2));
      reply(Boom.badImplementation(err));
    });
  }
};

exports.find = {
  auth: { mode: 'try', strategy: 'jwt' },
  validate: {
    params: {
      id: Joi.alternatives().try(Joi.string(), Joi.number()).required()
    }
  },
  handler: function(request, reply) {
    if (!request.server.methods.viewable(request)) { return reply({}); }

    db.boards.find(request.params.id)
    .then(function(board) { reply(board); })
    .catch(function(err) { reply(Boom.badImplementation(err)); });
  }
};

exports.all = {
  auth: { mode: 'try', strategy: 'jwt' },
  handler: function(request, reply) {
    if (!request.server.methods.viewable(request)) { return reply([]); }

    db.boards.all()
    .then(function(boards) { reply(boards); })
    .catch(function(err) { reply(Boom.badImplementation(err)); });
  }
};

exports.allCategories = {
  auth: { mode: 'try', strategy: 'jwt' },
  handler: function(request, reply) {
    if (!request.server.methods.viewable(request)) { return reply([]); }

    db.boards.allCategories()
    .then(function(categories) { reply(categories); })
    .catch(function(err) {
      reply(Boom.badImplementation(err));
    });
  }
};

exports.updateCategories = {
  auth: { mode: 'required', strategy: 'jwt' },
  pre: [ { method: pre.adminCheck } ],
  validate: {
    payload: {
      categories: Joi.array().required(),
    }
  },
  handler: function(request, reply) {
    // update board on db
    db.boards.updateCategories(request.payload.categories)
    .then(function(board) { reply(board); })
    .catch(function(err) { reply(Boom.badImplementation(err)); });
  }
};

exports.update = {
  auth: { mode: 'required', strategy: 'jwt' },
  validate: {
    payload: {
      name: Joi.string().min(1).max(255),
      description: Joi.string().allow(''),
      category_id: [ Joi.string(), Joi.number() ],
      parent_id: [ Joi.string(), Joi.number() ],
      children_ids: Joi.array()
    },
    params: {
      id: Joi.alternatives().try(Joi.string(), Joi.number()).required()
    }
  },
  pre: [
    { method: pre.clean },
    { method: pre.adminCheck }
  ],
  handler: function(request, reply) {
    // build updateBoard object from params and payload
    var updateBoard = {
      id: request.params.id,
      name: request.payload.name,
      description: request.payload.description,
      children_ids: request.payload.children_ids,
      parent_id: request.payload.parent_id
    };

    // update board on db
    db.boards.update(updateBoard)
    .then(function(board) { reply(board); })
    .catch(function() { reply(Boom.badImplementation(err)); });
  }
};

exports.delete = {
  auth: { mode: 'required', strategy: 'jwt' },
  validate: {
    params: {
      id: Joi.alternatives().try(Joi.string(), Joi.number()).required()
    }
  },
  handler: function(request, reply) {
    db.boards.delete(request.params.id)
    .then(function(board) { reply(board); })
    .catch(function() { reply(Boom.badImplementation(err)); });
  }
};
