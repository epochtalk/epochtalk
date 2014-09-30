var core = require('epochcore')();
var userSchema = require('../schema/users');

exports.create = {
  handler: function(request, reply) {
    // build the user object from payload and params
    var newUser = {
      username: request.payload.username,
      email: request.payload.email,
      password: request.payload.password,
      confirmation: request.payload.confirmation
    };

    // create the thread in core
    core.users.create(newUser)
    .then(function(user) { reply(user); })
    .catch(function(err) { reply(err.message); });
  },
  validate: { payload: userSchema.validate }
};

exports.find = {
  handler: function(request, reply) {
    var userId = request.params.id || request.query.id;
    core.users.find(userId)
    .then(function(user) { reply(user); })
    .catch(function(err) { reply(err.message); });
  }
};
