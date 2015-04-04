var path = require('path');
var Hapi = require('hapi');
var Boom = require('boom');
var pre = require(path.normalize(__dirname + '/pre'));
var db = require(path.normalize(__dirname + '/../../../db'));

// Route handlers/configs
exports.create = {
  auth: { mode: 'required', strategy: 'jwt' },
  // validate: { payload: boardValidator.schema.create },
  pre: [ { method: pre.clean } ],
  handler: function(request, reply) {
    db.categories.create(request.payload)
    .then(function(board) { reply(board); })
    .catch(function(err) { reply(Boom.badImplementation(err)); });
  }
};

exports.import = {
  // validate: { payload: boardValidator.schema.import },
  pre: [ { method: pre.clean } ],
  handler: function(request, reply) {
    db.categories.import(request.payload)
    .then(function(board) { reply(board); })
    .catch(function(err) { reply(Boom.badImplementation(err)); });
  }
};

exports.find = {
  auth: { mode: 'try', strategy: 'jwt' },
  // validate: { params: boardValidator.id },
  handler: function(request, reply) {
    if (!request.server.methods.viewable(request)) { return reply({}); }
    db.categories.find(request.params.id)
    .then(function(board) { reply(board); })
    .catch(function(err) { reply(Boom.badImplementation(err)); });
  }
};

exports.all = {
  auth: { mode: 'try', strategy: 'jwt' },
  handler: function(request, reply) {
    if (!request.server.methods.viewable(request)) { return reply([]); }
    db.categories.all()
    .then(function(categories) { reply(categories); })
    .catch(function(err) { reply(Boom.badImplementation(err)); });
  }
};
