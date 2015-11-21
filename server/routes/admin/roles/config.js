var Joi = require('joi');
var Boom = require('boom');
var path = require('path');
var pre = require(path.normalize(__dirname + '/pre'));
var db = require(path.normalize(__dirname + '/../../../../db'));
var rolesHelper = require(path.normalize(__dirname + '/../../../plugins/acls/helper'));
var _ = require('lodash');

/**
  * @apiVersion 0.3.0
  * @apiGroup Roles
  * @api {GET} /admin/roles/all All Roles
  * @apiName AllRoles
  * @apiPermission Super Administrator, Administrator
  * @apiDescription Retrieve all role.
  *
  * @apiSuccess {array} roles An array of all the roles.
  *
  * @apiError (Error 500) InternalServerError There was an issue retrieving the roles.
  */
exports.all = {
  auth: { strategy: 'jwt' },
  plugins: { acls: 'adminRoles.all' },
  handler: function(request, reply) {
    var promise = db.roles.all();
    return reply(promise);
  }
};

/**
  * @apiVersion 0.3.0
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
  * @apiSuccess {string} userData.users.user The The username of the user
  * @apiSuccess {string} userData.users.email The email of the user
  * @apiSuccess {number} userData.count The total number of users within this role. Used for paging
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
    var promise = db.roles.users(roleId, opts)
    .then(function(userData) {
      userData.users.map(function(user) {
        user.priority = _.min(user.roles.map(function(role) { return role.priority; }));
        user.roles = user.roles.map(function(role) { return role.lookup; });
      });
      return userData;
    });
    return reply(promise);
  }
};

/**
  * @apiVersion 0.3.0
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
  plugins: { acls: 'adminRoles.add' },
  validate: {
    payload: {
      id: Joi.string(),
      name: Joi.string().min(1).max(255).required(),
      description: Joi.string().min(1).max(1000).required(),
      priority: Joi.number().min(0).max(Number.MAX_VALUE).required(),
      highlight_color: Joi.string(),
      permissions: Joi.object().keys({
        adminAccess: Joi.object().keys({
          settings: Joi.object().keys({
            general: Joi.boolean(),
            forum: Joi.boolean(),
            theme: Joi.boolean()
          }),
          management: Joi.object().keys({
            boards: Joi.boolean(),
            users: Joi.boolean(),
            roles: Joi.boolean()
          })
        }),
        modAccess: Joi.object().keys({
          users: Joi.boolean(),
          posts: Joi.boolean(),
          messages: Joi.boolean()
        }),
        adminRoles: Joi.object().keys({
          all: Joi.boolean(),
          users: Joi.boolean(),
          add: Joi.boolean(),
          update: Joi.boolean(),
          remove: Joi.boolean(),
          reprioritize: Joi.boolean()
        }),
        adminReports: Joi.object().keys({
          createUserReportNote: Joi.boolean(),
          createPostReportNote: Joi.boolean(),
          createMessageReportNote: Joi.boolean(),
          updateUserReport: Joi.boolean(),
          updatePostReport: Joi.boolean(),
          updateMessageReport: Joi.boolean(),
          updateUserReportNote: Joi.boolean(),
          updatePostReportNote: Joi.boolean(),
          updateMessageReportNote: Joi.boolean(),
          pageUserReports: Joi.boolean(),
          pagePostReports: Joi.boolean(),
          pageMessageReports: Joi.boolean(),
          pageUserReportsNotes: Joi.boolean(),
          pagePostReportsNotes: Joi.boolean(),
          pageMessageReportsNotes: Joi.boolean(),
          userReportsCount: Joi.boolean(),
          postReportsCount: Joi.boolean(),
          messageReportsCount: Joi.boolean(),
          userReportsNotesCount: Joi.boolean(),
          postReportsNotesCount: Joi.boolean(),
          messageReportsNotesCount: Joi.boolean()
        }),
        adminSettings: Joi.object().keys({
          find: Joi.boolean(),
          update: Joi.boolean(),
          getTheme: Joi.boolean(),
          setTheme: Joi.boolean(),
          resetTheme: Joi.boolean(),
          previewTheme: Joi.boolean()
        }),
        adminUsers: Joi.object().keys({
          privilegedUpdate: Joi.object().keys({
            samePriority: Joi.boolean(),
            lowerPriority: Joi.boolean()
          }),
          privilegedAddRoles: Joi.object().keys({
            samePriority: Joi.boolean(),
            lowerPriority: Joi.boolean()
          }),
          privilegedRemoveRoles: Joi.object().keys({
            samePriority: Joi.boolean(),
            lowerPriority: Joi.boolean()
          }),
          update: Joi.boolean(),
          find: Joi.boolean(),
          addRoles: Joi.boolean(),
          removeRoles: Joi.boolean(),
          searchUsernames: Joi.boolean(),
          count: Joi.boolean(),
          countAdmins: Joi.boolean(),
          countModerators: Joi.boolean(),
          page: Joi.boolean(),
          pageAdmins: Joi.boolean(),
          pageModerators: Joi.boolean(),
          ban: Joi.boolean(),
          unban: Joi.boolean()
        }),
        adminModerators: Joi.object().keys({
          add: Joi.boolean(),
          remove: Joi.boolean()
        }),
        boards: Joi.object().keys({
          viewUncategorized: Joi.object().keys({
            some: Joi.boolean(),
            all: Joi.boolean()
          }),
          create: Joi.boolean(),
          find: Joi.boolean(),
          all: Joi.boolean(),
          allCategories: Joi.boolean(),
          updateCategories: Joi.boolean(),
          update: Joi.boolean(),
          delete: Joi.boolean()
        }),
        categories: Joi.object().keys({
          create: Joi.boolean(),
          find: Joi.boolean(),
          all: Joi.boolean(),
          delete: Joi.boolean()
        }),
        conversations: Joi.object().keys({
          create: Joi.boolean(),
          messages: Joi.boolean(),
          delete: Joi.boolean()
        }),
        messages: Joi.object().keys({
          privilegedDelete: Joi.boolean(),
          create: Joi.boolean(),
          latest: Joi.boolean(),
          findUser: Joi.boolean(),
          delete: Joi.boolean()
        }),
        posts: Joi.object().keys({
          privilegedUpdate: Joi.object().keys({
            some: Joi.boolean(),
            all: Joi.boolean()
          }),
          privilegedDelete: Joi.object().keys({
            some: Joi.boolean(),
            all: Joi.boolean()
          }),
          privilegedPurge: Joi.object().keys({
            some: Joi.boolean(),
            all: Joi.boolean()
          }),
          viewDeleted: Joi.object().keys({
            some: Joi.boolean(),
            all: Joi.boolean()
          }),
          bypassLock: Joi.object().keys({
            some: Joi.boolean(),
            all: Joi.boolean()
          }),
          create: Joi.boolean(),
          find: Joi.boolean(),
          byThread: Joi.boolean(),
          update: Joi.boolean(),
          delete: Joi.boolean(),
          undelete: Joi.boolean(),
          purge: Joi.boolean(),
          pageByUser: Joi.boolean()
        }),
        reports: Joi.object().keys({
          createUserReport: Joi.boolean(),
          createPostReport: Joi.boolean(),
          createMessageReport: Joi.boolean()
        }),
        threads: Joi.object().keys({
          privilegedTitle: Joi.object().keys({
            some: Joi.boolean(),
            all: Joi.boolean()
          }),
          privilegedLock: Joi.object().keys({
            some: Joi.boolean(),
            all: Joi.boolean()
          }),
          privilegedSticky: Joi.object().keys({
            some: Joi.boolean(),
            all: Joi.boolean()
          }),
          privilegedMove: Joi.object().keys({
            some: Joi.boolean(),
            all: Joi.boolean()
          }),
          privilegedPurge: Joi.object().keys({
            some: Joi.boolean(),
            all: Joi.boolean()
          }),
          create: Joi.boolean(),
          byBoard: Joi.boolean(),
          viewed: Joi.boolean(),
          title: Joi.boolean(),
          lock: Joi.boolean(),
          sticky: Joi.boolean(),
          move: Joi.boolean(),
          purge: Joi.boolean()
        }),
        users: Joi.object().keys({
          privilegedDeactivate: Joi.object().keys({
            samePriority: Joi.boolean(),
            lowerPriority: Joi.boolean()
          }),
          privilegedReactivate: Joi.object().keys({
            samePriority: Joi.boolean(),
            lowerPriority: Joi.boolean()
          }),
          privilegedDelete: Joi.object().keys({
            samePriority: Joi.boolean(),
            lowerPriority: Joi.boolean()
          }),
          viewDeleted: Joi.boolean(),
          update: Joi.boolean(),
          find: Joi.boolean(),
          deactivate: Joi.boolean(),
          reactivate: Joi.boolean(),
          delete: Joi.boolean()
        })
      }).required()
    }
  },
  handler: function(request, reply) {
    var role = request.payload;
    var promise = db.roles.add(role)
    .then(function(result) {
      role.id = result.id;
      role.lookup = result.id;
      // Add role to the in memory role object
      rolesHelper.addRole(role);
      return result;
    })
    .catch(function(err) {
      if (err.cause && err.cause.code === '23505') {
        return Boom.badRequest('Role name must be unique.');
      }
      else { return Boom.badImplementation(err); }
    });
    return reply(promise);
  }
};

/**
  * @apiVersion 0.3.0
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
  plugins: { acls: 'adminRoles.update' },
  validate: {
    payload: {
      id: Joi.string().required(),
      name: Joi.string().min(1).max(255).required(),
      description: Joi.string().min(1).max(1000).required(),
      priority: Joi.number().min(0).max(Number.MAX_VALUE).required(),
      highlight_color: Joi.string(),
      lookup: Joi.string().required(),
      permissions: Joi.object().keys({
        adminAccess: Joi.object().keys({
          settings: Joi.object().keys({
            general: Joi.boolean(),
            forum: Joi.boolean(),
            theme: Joi.boolean()
          }),
          management: Joi.object().keys({
            boards: Joi.boolean(),
            users: Joi.boolean(),
            roles: Joi.boolean()
          })
        }),
        modAccess: Joi.object().keys({
          users: Joi.boolean(),
          posts: Joi.boolean(),
          messages: Joi.boolean()
        }),
        adminRoles: Joi.object().keys({
          all: Joi.boolean(),
          users: Joi.boolean(),
          add: Joi.boolean(),
          update: Joi.boolean(),
          remove: Joi.boolean(),
          reprioritize: Joi.boolean()
        }),
        adminReports: Joi.object().keys({
          createUserReportNote: Joi.boolean(),
          createPostReportNote: Joi.boolean(),
          createMessageReportNote: Joi.boolean(),
          updateUserReport: Joi.boolean(),
          updatePostReport: Joi.boolean(),
          updateMessageReport: Joi.boolean(),
          updateUserReportNote: Joi.boolean(),
          updatePostReportNote: Joi.boolean(),
          updateMessageReportNote: Joi.boolean(),
          pageUserReports: Joi.boolean(),
          pagePostReports: Joi.boolean(),
          pageMessageReports: Joi.boolean(),
          pageUserReportsNotes: Joi.boolean(),
          pagePostReportsNotes: Joi.boolean(),
          pageMessageReportsNotes: Joi.boolean(),
          userReportsCount: Joi.boolean(),
          postReportsCount: Joi.boolean(),
          messageReportsCount: Joi.boolean(),
          userReportsNotesCount: Joi.boolean(),
          postReportsNotesCount: Joi.boolean(),
          messageReportsNotesCount: Joi.boolean()
        }),
        adminSettings: Joi.object().keys({
          find: Joi.boolean(),
          update: Joi.boolean(),
          getTheme: Joi.boolean(),
          setTheme: Joi.boolean(),
          resetTheme: Joi.boolean(),
          previewTheme: Joi.boolean()
        }),
        adminUsers: Joi.object().keys({
          privilegedUpdate: Joi.object().keys({
            samePriority: Joi.boolean(),
            lowerPriority: Joi.boolean()
          }),
          privilegedAddRoles: Joi.object().keys({
            samePriority: Joi.boolean(),
            lowerPriority: Joi.boolean()
          }),
          privilegedRemoveRoles: Joi.object().keys({
            samePriority: Joi.boolean(),
            lowerPriority: Joi.boolean()
          }),
          update: Joi.boolean(),
          find: Joi.boolean(),
          addRoles: Joi.boolean(),
          removeRoles: Joi.boolean(),
          searchUsernames: Joi.boolean(),
          count: Joi.boolean(),
          countAdmins: Joi.boolean(),
          countModerators: Joi.boolean(),
          page: Joi.boolean(),
          pageAdmins: Joi.boolean(),
          pageModerators: Joi.boolean(),
          ban: Joi.boolean(),
          unban: Joi.boolean()
        }),
        adminModerators: Joi.object().keys({
          add: Joi.boolean(),
          remove: Joi.boolean()
        }),
        boards: Joi.object().keys({
          viewUncategorized: Joi.object().keys({
            some: Joi.boolean(),
            all: Joi.boolean()
          }),
          create: Joi.boolean(),
          find: Joi.boolean(),
          all: Joi.boolean(),
          allCategories: Joi.boolean(),
          updateCategories: Joi.boolean(),
          update: Joi.boolean(),
          delete: Joi.boolean()
        }),
        categories: Joi.object().keys({
          create: Joi.boolean(),
          find: Joi.boolean(),
          all: Joi.boolean(),
          delete: Joi.boolean()
        }),
        conversations: Joi.object().keys({
          create: Joi.boolean(),
          messages: Joi.boolean(),
          delete: Joi.boolean()
        }),
        messages: Joi.object().keys({
          create: Joi.boolean(),
          latest: Joi.boolean(),
          findUser: Joi.boolean(),
          delete: Joi.boolean()
        }),
        posts: Joi.object().keys({
          privilegedUpdate: Joi.object().keys({
            some: Joi.boolean(),
            all: Joi.boolean()
          }),
          privilegedDelete: Joi.object().keys({
            some: Joi.boolean(),
            all: Joi.boolean()
          }),
          privilegedPurge: Joi.object().keys({
            some: Joi.boolean(),
            all: Joi.boolean()
          }),
          viewDeleted: Joi.object().keys({
            some: Joi.boolean(),
            all: Joi.boolean()
          }),
          bypassLock: Joi.object().keys({
            some: Joi.boolean(),
            all: Joi.boolean()
          }),
          create: Joi.boolean(),
          find: Joi.boolean(),
          byThread: Joi.boolean(),
          update: Joi.boolean(),
          delete: Joi.boolean(),
          undelete: Joi.boolean(),
          purge: Joi.boolean(),
          pageByUser: Joi.boolean()
        }),
        reports: Joi.object().keys({
          createUserReport: Joi.boolean(),
          createPostReport: Joi.boolean(),
          createMessageReport: Joi.boolean()
        }),
        threads: Joi.object().keys({
          privilegedTitle: Joi.object().keys({
            some: Joi.boolean(),
            all: Joi.boolean()
          }),
          privilegedLock: Joi.object().keys({
            some: Joi.boolean(),
            all: Joi.boolean()
          }),
          privilegedSticky: Joi.object().keys({
            some: Joi.boolean(),
            all: Joi.boolean()
          }),
          privilegedMove: Joi.object().keys({
            some: Joi.boolean(),
            all: Joi.boolean()
          }),
          privilegedPurge: Joi.object().keys({
            some: Joi.boolean(),
            all: Joi.boolean()
          }),
          create: Joi.boolean(),
          byBoard: Joi.boolean(),
          viewed: Joi.boolean(),
          title: Joi.boolean(),
          lock: Joi.boolean(),
          sticky: Joi.boolean(),
          move: Joi.boolean(),
          purge: Joi.boolean()
        }),
        users: Joi.object().keys({
          privilegedDeactivate: Joi.object().keys({
            samePriority: Joi.boolean(),
            lowerPriority: Joi.boolean()
          }),
          privilegedReactivate: Joi.object().keys({
            samePriority: Joi.boolean(),
            lowerPriority: Joi.boolean()
          }),
          privilegedDelete: Joi.object().keys({
            samePriority: Joi.boolean(),
            lowerPriority: Joi.boolean()
          }),
          viewDeleted: Joi.boolean(),
          update: Joi.boolean(),
          find: Joi.boolean(),
          deactivate: Joi.boolean(),
          reactivate: Joi.boolean(),
          delete: Joi.boolean()
        })
      }).required()
    }
  },
  handler: function(request, reply) {
    var role = request.payload;
    var promise = db.roles.update(role)
    .then(function(result) {
      role.id = result.id; // undoes deslugify which happens in core
      // Update role in the in memory role object
      rolesHelper.updateRole(role);
      return result;
    })
    .catch(function(err) {
      if (err.cause && err.cause.code === '23505') {
        return Boom.badRequest('Role name must be unique.');
      }
      else { return Boom.badImplementation(err); }
    });
    return reply(promise);
  }
};

/**
  * @apiVersion 0.3.0
  * @apiGroup Roles
  * @api {DELETE} /admin/roles/remove/:id Remove Roles
  * @apiName RemoveRoles
  * @apiPermission Super Administrator, Administrator
  * @apiDescription Remove a role.
  *
  * @apiParam (Params) {string} role_id The id of the role to remove.
  *
  * @apiSuccess {string} id The unique id of the removed role.
  *
  * @apiError (Error 500) InternalServerError There was an issue removing the role.
  */
exports.remove = {
  auth: { strategy: 'jwt' },
  plugins: { acls: 'adminRoles.remove' },
  validate: { params: { id: Joi.string().required() } },
  pre: [ { method: pre.preventDefaultRoleDeletion } ],
  handler: function(request, reply) {
    var id = request.params.id;
    var promise = db.roles.remove(id)
    .then(function(result) {
      // Remove deleted role from in memory object
      rolesHelper.deleteRole(id);
      return result;
    });
    return reply(promise);
  }
};

/**
  * @apiVersion 0.3.0
  * @apiGroup Roles
  * @api {UPDATE} /admin/roles/reprioritize Reprioritize Roles
  * @apiName ReprioritizeRoles
  * @apiPermission Super Administrator, Administrator
  * @apiDescription Reprioritizes all roles.
  *
  * @apiParam (Payload) {Array} roles with new priorities.
  *
  * @apiSuccess {} 200 OK SUCCESS.
  *
  * @apiError (Error 500) InternalServerError There was an issue reprioritizing the roles.
  */
exports.reprioritize = {
  auth: { strategy: 'jwt' },
  plugins: { acls: 'adminRoles.reprioritize' },
  validate: {
    payload: Joi.array(Joi.object().keys({
      id: Joi.string().required(),
      priority: Joi.number().min(0).max(Number.MAX_VALUE).required()
    }))
  },
  handler: function(request, reply) {
    var roles = request.payload;
    var promise = db.roles.reprioritize(roles)
    .then(function(result) {
      // update priorities for in memory roles object
      rolesHelper.reprioritizeRoles(roles);
      return result;
    });
    return reply(promise);
  }
};

