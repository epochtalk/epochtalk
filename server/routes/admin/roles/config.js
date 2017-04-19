var Joi = require('joi');
var _ = require('lodash');

/**
  * @apiVersion 0.4.0
  * @apiGroup Roles
  * @api {GET} /admin/roles/all All Roles
  * @apiName AllRoles
  * @apiPermission Super Administrator, Administrator
  * @apiDescription Retrieve all role.
  *
  * @apiSuccess {object[]} roles An array of all the roles.
  * @apiSuccess {string} roles.id The unique id of the role
  * @apiSuccess {string} roles.name The name of the role
  * @apiSuccess {string} roles.description The description of the role
  * @apiSuccess {string} roles.lookup A unique identifier for the role
  * @apiSuccess {number{0..n}} roles.priority The priority of the role, with 0 being the highest priority
  * @apiSuccess {string} roles.highlight_color An html hex value color used to highlight users based on their role
  * @apiSuccess {object} permissions An object containing all this roles permissions
  *
  * @apiError (Error 500) InternalServerError There was an issue retrieving the roles.
  */
exports.all = {
  auth: { strategy: 'jwt' },
  plugins: { acls: 'adminRoles.all' },
  handler: function(request, reply) {
    var promise = request.db.roles.all()
    .then((roles) => { return { roles: roles, layouts: request.roleLayouts }; })
    .error(request.errorMap.toHttpError);

    return reply(promise);
  }
};

/**
  * @apiVersion 0.4.0
  * @apiGroup Roles
  * @api {GET} /admin/roles/:id/users Page Users with Role
  * @apiName PageUserWithRole
  * @apiPermission Super Administrator, Administrator
  * @apiDescription Page all users with a particular role.
  *
  * @apiParam (Payload) {string} id The id of the role to find users for
  *
  * @apiParam (Query) {number} page=1 The page of users to retrieve
  * @apiParam (Query) {number} limit=15 The number of users to retrieve per page
  *
  * @apiSuccess {object} userData An object containing user data.
  * @apiSuccess {object[]} userData.users An array holding users with this role
  * @apiSuccess {string} userData.users.id The id of the user
  * @apiSuccess {string} userData.users.username The The username of the user
  * @apiSuccess {string} userData.users.email The email of the user
  * @apiSuccess {string[]} userData.users.roles An array containing the lookups values of all the roles this user has
  * @apiSuccess {number} userData.users.priority The user's highest role priority
  *
  * @apiError (Error 500) InternalServerError There was an issue retrieving the user data.
  */
exports.users = {
  auth: { strategy: 'jwt' },
  plugins: { acls: 'adminRoles.users' },
  validate: {
    params: { id: Joi.string().required() },
    query: {
      page: Joi.number().integer().min(1).default(1),
      limit: Joi.number().integer().min(1).max(100).default(15),
      search: Joi.string()
    }
  },
  handler: function(request, reply) {
    var roleId = request.params.id;
    var opts = {
      page: request.query.page,
      limit: request.query.limit,
      searchStr: request.query.search
    };
    var promise = request.db.roles.users(roleId, opts)
    .then(function(userData) {
      userData.users.map(function(user) {
        user.priority = _.min(user.roles.map(function(role) { return role.priority; }));
        user.roles = user.roles.map(function(role) { return role.lookup; });
      });
      return userData;
    })
    .error(request.errorMap.toHttpError);

    return reply(promise);
  }
};

/**
  * @apiVersion 0.4.0
  * @apiGroup Roles
  * @api {POST} /admin/roles/add Add Roles
  * @apiName AddRoles
  * @apiPermission Super Administrator, Administrator
  * @apiDescription Add a new role.
  *
  * @apiParam (Payload) {string} [id] The id of the role to add, for hardcoded ids.
  * @apiParam (Payload) {string} name The name of the role to add.
  * @apiParam (Payload) {string} description The description of the role to add.
  * @apiParam (Payload) {string} priority The priorty of the role to add.
  * @apiParam (Payload) {string} highlightColor The highlight color of the role to add.
  * @apiParam (Payload) {Object} permissions The permission set for this role.
  *
  * @apiSuccess {string} id The unique id of the added role.
  *
  * @apiError (Error 400) BadRequest There name of the role must be unique.
  * @apiError (Error 500) InternalServerError There was an issue adding the role.
  */
exports.add = {
  auth: { strategy: 'jwt' },
  plugins: {
    acls: 'adminRoles.add',
    mod_log: {
      type: 'adminRoles.add',
      data: {
        id: 'payload.id',
        name: 'payload.name',
        description: 'payload.description'
      }
    }
  },
  validate: {
    payload: {
      id: Joi.string(),
      name: Joi.string().min(1).max(255).required(),
      description: Joi.string().min(1).max(1000).required(),
      priority: Joi.number().min(0).max(Number.MAX_VALUE).required(),
      highlight_color: Joi.string(),
      permissions: Joi.object().required()
    }
  },
  pre: [ { method: 'auth.admin.roles.validate(roleValidations, payload)' } ],
  handler: function(request, reply) {
    var role = request.payload;
    var promise = request.db.roles.create(role)
    .then(function(result) {
      role.id = result.id;
      role.lookup = result.id;
      // Add role to the in memory role object
      request.rolesAPI.addRole(role);
      return result;
    })
    .error(request.errorMap.toHttpError);

    return reply(promise);
  }
};

/**
  * @apiVersion 0.4.0
  * @apiGroup Roles
  * @api {PUT} /admin/roles/update Add Roles
  * @apiName UpdateRoles
  * @apiPermission Super Administrator, Administrator
  * @apiDescription Add a new role.
  *
  * @apiParam (Payload) {string} id The id of the role to update.
  * @apiParam (Payload) {string} name The updated name of the role.
  * @apiParam (Payload) {string} description The updated description of the role.
  * @apiParam (Payload) {string} priority The updated priorty of the role.
  * @apiParam (Payload) {string} [highlightColor] The updated highlight color.
  * @apiParam (Payload) {Object} permissions The updated permission set.
  *
  * @apiSuccess {string} id The unique id of the updated role.
  *
  * @apiError (Error 400) BadRequest There name of the role must be unique.
  * @apiError (Error 500) InternalServerError There was an issue adding the role.
  */
exports.update = {
  auth: { strategy: 'jwt' },
  plugins: {
    acls: 'adminRoles.update',
    mod_log: {
      type: 'adminRoles.update',
      data: {
        id: 'payload.id',
        name: 'payload.name'
      }
    }
  },
  validate: {
    payload: {
      id: Joi.string().required(),
      name: Joi.string().min(1).max(255).required(),
      description: Joi.string().min(1).max(1000).required(),
      priority: Joi.number().min(0).max(Number.MAX_VALUE).required(),
      highlight_color: Joi.string(),
      permissions: Joi.object().required()
    }
  },
  pre: [ { method: 'auth.admin.roles.validate(roleValidations, payload)' } ],
  handler: function(request, reply) {
    var role = request.payload;
    role.lookup = role.id;
    var promise = request.db.roles.update(role)
    .tap(function(dbRole) {
      var roleClone = _.cloneDeep(dbRole);
      var notification = {
        channel: { type: 'role', id: roleClone.lookup },
        data: {}
      };
      request.server.plugins.notifications.systemNotification(notification);
    })
    .then(function(result) {
      role.id = result.id; // undoes deslugify which happens in core
      // Update role in the in memory role object
      request.rolesAPI.updateRole(role);
      return result;
    })
    .error(request.errorMap.toHttpError);

    return reply(promise);
  }
};

/**
  * @apiVersion 0.4.0
  * @apiGroup Roles
  * @api {DELETE} /admin/roles/remove/:id Remove Roles
  * @apiName RemoveRoles
  * @apiPermission Super Administrator, Administrator
  * @apiDescription Remove a role.
  *
  * @apiParam (Params) {string} role_id The id of the role to remove.
  *
  * @apiSuccess {string} id The unique id of the removed role.
  * @apiSuccess {string} name The name of the removed role.
  *
  * @apiError (Error 500) InternalServerError There was an issue removing the role.
  */
exports.remove = {
  auth: { strategy: 'jwt' },
  plugins: {
    acls: 'adminRoles.remove',
    mod_log: {
      type: 'adminRoles.remove',
      data: {
        id: 'params.id',
        name: 'route.settings.plugins.mod_log.metadata.name'
      }
    }
  },
  validate: { params: { id: Joi.string().required() } },
  pre: [ { method: 'auth.admin.roles.remove(params.id)' } ],
  handler: function(request, reply) {
    var id = request.params.id;
    var promise = request.db.roles.delete(id)
    .then(function(result) {
      // Add deleted role name to plugin metadata
      request.route.settings.plugins.mod_log.metadata = {
        name: result.name
      };

      // Remove deleted role from in memory object
      request.rolesAPI.deleteRole(id);
      return result;
    })
    .error(request.errorMap.toHttpError);

    return reply(promise);
  }
};

/**
  * @apiVersion 0.4.0
  * @apiGroup Roles
  * @api {UPDATE} /admin/roles/reprioritize Reprioritize Roles
  * @apiName ReprioritizeRoles
  * @apiPermission Super Administrator, Administrator
  * @apiDescription Reprioritizes all roles.
  *
  * @apiParam (Payload) {string} roles.id The id of the role
  * @apiParam (Payload) {string} roles.priority The updated priorty of the role
  *
  * @apiSuccess {object} STATUS 200 OK
  *
  * @apiError (Error 500) InternalServerError There was an issue reprioritizing the roles.
  */
exports.reprioritize = {
  auth: { strategy: 'jwt' },
  plugins: {
    acls: 'adminRoles.reprioritize',
    mod_log: { type: 'adminRoles.reprioritize' }
  },
  validate: {
    payload: Joi.array(Joi.object().keys({
      id: Joi.string().required(),
      priority: Joi.number().min(0).max(Number.MAX_VALUE).required()
    }))
  },
  handler: function(request, reply) {
    var roles = request.payload;
    var promise = request.db.roles.reprioritize(roles)
    .then(function(result) {
      // update priorities for in memory roles object
      request.rolesAPI.reprioritizeRoles(roles);
      return result;
    })
    .error(request.errorMap.toHttpError);

    return reply(promise);
  }
};
