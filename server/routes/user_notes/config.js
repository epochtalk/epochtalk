var Joi = require('joi');
var Promise = require('bluebird');

exports.page = {
 auth: { strategy: 'jwt' },
 plugins: { acls: 'userNotes.page' },
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

exports.create = {
  auth: { strategy: 'jwt' },
  plugins: {
    acls: 'userNotes.create',
    mod_log: {
      type: 'userNotes.create',
      data: {
        id: 'route.settings.plugins.mod_log.metadata.id',
        user_id: 'route.settings.plugins.mod_log.metadata.user_id',
        author_id: 'route.settings.plugins.mod_log.metadata.author_id',
        note: 'route.settings.plugins.mod_log.metadata.note',
        created_at: 'route.settings.plugins.mod_log.metadata.created_at',
        updated_at: 'route.settings.plugins.mod_log.metadata.updated_at'
      }
    }
  },
  validate: {
    payload: {
      user_id: Joi.string().required(),
      author_id: Joi.string().required(),
      note: Joi.string().min(2).max(2000).required()
    }
  },
  handler: function(request, reply) {
    var opts = Object.assign({}, request.payload);
    var promise =  request.db.userNotes.create(opts)
    .then(function(createdNote) {
      request.route.settings.plugins.mod_log.metadata = createdNote;
      return createdNote;
    });
    return reply(promise);
  }
};

exports.update = {
  auth: { strategy: 'jwt' },
  plugins: {
    acls: 'userNotes.update',
    mod_log: {
      type: 'userNotes.update',
      data: {
        id: 'route.settings.plugins.mod_log.metadata.id',
        user_id: 'route.settings.plugins.mod_log.metadata.user_id',
        author_id: 'route.settings.plugins.mod_log.metadata.author_id',
        note: 'route.settings.plugins.mod_log.metadata.note',
        created_at: 'route.settings.plugins.mod_log.metadata.created_at',
        updated_at: 'route.settings.plugins.mod_log.metadata.updated_at'
      }
    }
  },
  validate: {
    payload: {
      id: Joi.string().required(),
      note: Joi.string().min(2).max(2000).required()
    }
  },
  pre: [ { method: 'auth.userNotes.isOwner(server, auth, payload.id)' } ],
  handler: function(request, reply) {
    var opts = Object.assign({}, request.payload);
    var promise =  request.db.userNotes.update(opts)
    .then(function(updatedNote) {
      request.route.settings.plugins.mod_log.metadata = updatedNote;
      return updatedNote;
    });
    return reply(promise);
  }
};

exports.delete = {
  auth: { strategy: 'jwt' },
  plugins: {
    acls: 'userNotes.delete',
    mod_log: {
      type: 'userNotes.delete',
      data: {
        id: 'route.settings.plugins.mod_log.metadata.id',
        user_id: 'route.settings.plugins.mod_log.metadata.user_id',
        author_id: 'route.settings.plugins.mod_log.metadata.author_id',
        note: 'route.settings.plugins.mod_log.metadata.note',
        created_at: 'route.settings.plugins.mod_log.metadata.created_at',
        updated_at: 'route.settings.plugins.mod_log.metadata.updated_at'
      }
    }
  },
  validate: { query: { id: Joi.string().required() } },
  pre: [ { method: 'auth.userNotes.isOwner(server, auth, query.id)' } ],
  handler: function(request, reply) {
    var opts = Object.assign({}, request.query);
    var promise =  request.db.userNotes.delete(opts.id)
    .then(function(deletedNote) {
      request.route.settings.plugins.mod_log.metadata = deletedNote;
      return deletedNote;
    });
    return reply(promise);
  }
};
