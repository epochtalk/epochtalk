var core = require('epoch-core-pg')();
var Hapi = require('hapi');
var path = require('path');
var pre = require(path.join(__dirname, 'pre'));

// Route handlers/configs
exports.create = {
  auth: { mode: 'required', strategy: 'jwt' },
  // validate: { payload: boardValidator.schema.create },
  pre: [ { method: pre.clean } ],
  handler: function(request, reply) {
    core.categories.create(request.payload)
    .then(function(board) { reply(board); })
    .catch(function() { reply(Hapi.error.internal()); });
  }
};

exports.import = {
  // validate: { payload: boardValidator.schema.import },
  pre: [ { method: pre.clean } ],
  handler: function(request, reply) {
    core.categories.import(request.payload)
    .then(function(board) { reply(board); })
    .catch(function(err) { reply(err); });
  }
};

exports.find = {
  // validate: { params: boardValidator.id },
  handler: function(request, reply) {
    core.categories.find(request.params.id)
    .then(function(board) { reply(board); })
    .catch(function() { reply(Hapi.error.internal()); });
  }
};

exports.all = {
  handler: function(request, reply) {
    core.categories.all()
    .then(function(categories) { reply(categories); })
    .catch(function() { reply(Hapi.error.internal()); });
  }
};
