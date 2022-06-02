var intersection = require('lodash/intersection');

var ctrl = ['$rootScope', '$scope', '$location', 'Session', 'Alert', 'Roles', 'User', 'pageData', 'userData', 'roleId', 'limit', 'page', 'search', function($rootScope, $scope, $location, Session, Alert, Roles, User, pageData, userData, roleId, limit, page, search) {
  var ctrl = this;
  this.parent = $scope.$parent.AdminManagementCtrl;
  this.parent.tab = 'roles';
  this.roles = pageData.roles;
  this.layouts = pageData.layouts;
  this.queryParams = $location.search();
  this.pageCount = Math.ceil(userData.count / limit);
  this.page = page;
  this.limit = limit;
  this.userData = userData;
  this.search = search;
  this.searchStr = search;
  this.roleId = roleId;
  this.selectedRole = null;
  this.showFilterUsers = false;
  this.maxPriority = null;
  this.newRole = {};
  this.basedRoleId = null;
  this.modifyingRole = false;
  this.controlAccess = Session.getControlAccessWithPriority('roles');
  this.controlAccess.privilegedRemoveRoles =  {
    samePriority: Session.hasPermission('users.removeRole.bypass.priority.same'),
    lowerPriority: Session.hasPermission('users.removeRole.bypass.priority.less')
  };
  this.controlAccess.privilegedAddRoles = {
    samePriority: Session.hasPermission('users.addRoles.bypass.priority.same'),
    lowerPriority: Session.hasPermission('users.addRoles.bypass.priority.less')
  };

  // rate limiting
  this.limits = {
    conversationCreate: { path: '/api/conversations', method: 'POST' },
    messageCreate: { path: '/api/messages', method: 'POST' },
    postCreate: { path: '/api/posts', method: 'POST' },
    postUpdate: { path: '/api/posts/{id}', method: 'POST' },
    threadCreate: { path: '/api/threads', method: 'POST' },
    reportUser: { path: '/api/reports/users', method: 'POST' },
    reportMessage: { path: '/api/reports/messages', method: 'POST' },
    reportPost: { path: '/api/reports/posts', method: 'POST' },
    userUpdate: { path: '/api/users/{id}', method: 'PUT'}
  };

  this.limiter = [
    this.limits.conversationCreate,
    this.limits.messageCreate,
    this.limits.postCreate,
    this.limits.postUpdate,
    this.limits.threadCreate,
    this.limits.reportUser,
    this.limits.reportMessage,
    this.limits.reportPost,
    this.limits.userUpdate
  ];

  this.hasLimits = function() {
    var usedLimits = ctrl.limiter.filter(function(limit) { return limit.use; });
    return usedLimits.length > 0;
  };

  this.resetLimits = function(roleLimits) {
    // clear our previous values
    ctrl.limiter.map(function(limit) {
      limit.interval = undefined;
      limit.maxInInterval = undefined;
      limit.minDifference = undefined;
    });

    if (!roleLimits || roleLimits.length === 0) { return; }

    // set values from this role
    roleLimits.map(function(limit) {
      // find match limit in this.limiter
      var memLimit = ctrl.limiter.filter(function(singleLimit) {
        return singleLimit.path === limit.path && singleLimit.method === limit.method;
      });

      if (memLimit.length > 0) {
        memLimit[0].interval = limit.interval;
        memLimit[0].maxInInterval = limit.maxInInterval;
        memLimit[0].minDifference = limit.minDifference;
      }
    });
  };

  // Assign selected role if view is visited with roleId query param
  pageData.roles.forEach(function(role) {
    if (roleId && roleId === role.id) {
      ctrl.selectedRole = role;
      $location.search(ctrl.queryParams);
    }
  });

  this.allPriorities = [];

  this.init = function() {
    ctrl.maxPriority = null;

    ctrl.allPriorities = [];
    ctrl.roles.forEach(function(role) { // remove private and anoymous priorities
      if (role.lookup !== 'private' && role.lookup !== 'anonymous') { ctrl.allPriorities.push(role.priority); }
    });

    ctrl.roles.forEach(function(role) {
      if (!ctrl.maxPriority) { ctrl.maxPriority = role.priority; }
      else { ctrl.maxPriority = ctrl.maxPriority < role.priority ? role.priority : ctrl.maxPriority;}

      if (role.lookup === 'user') {
        role.message = 'The ' + role.name + ' role is assigned by default.  By default all new registered users are considered users.  The userbase of this role may not be manually edited.  Permission changes to this role will affect all users without another role assigned.';
      }
      if (role.lookup === 'anonymous') {
        role.message = 'The ' + role.name + ' role is assigned by default to forum visitors who are not authenticated.  The user base of this role may not be manually edited.  Permission changes to this role will affect all unauthenticated users visiting the forum.';
      }
      if (role.lookup === 'private') {
        role.message = 'The ' + role.name + ' role is assigned by default to forum visitors who are not authenticated.  This role is only used if the "Public Forum" is set to off via the forum settings page.  This requires all visitors to log in before they can view the forum content.  The user base of this role may not be manually edited.  Permission changes to this role will affect all unauthenticated users visiting the forum.';
      }

      // Invert Priority Restrictions
      role.permissions.invertedRestrictions = ctrl.allPriorities;
      if (role.permissions.priorityRestrictions && role.permissions.priorityRestrictions.length) {
        role.permissions.invertedRestrictions = intersection(ctrl.allPriorities, role.permissions.priorityRestrictions);
      }
    });

    ctrl.backupPriorities = angular.copy(ctrl.roles);
  };

  this.init();

  this.toggleRestriction = function(priority) {
    var index = ctrl.newRole.permissions.invertedRestrictions.indexOf(priority);
    if (index > -1) { ctrl.newRole.permissions.invertedRestrictions.splice(index, 1); }
    else { ctrl.newRole.permissions.invertedRestrictions.push(priority); }
    var intersect = intersection(ctrl.newRole.permissions.invertedRestrictions, ctrl.allPriorities);
    if (intersect && intersect.length === ctrl.allPriorities.length) {
      ctrl.newRole.permissions.priorityRestrictions = undefined;
    }
    else { ctrl.newRole.permissions.priorityRestrictions = intersect; }
  };

  this.setBasePermissions = function() {
    var permissions = {};
    ctrl.roles.forEach(function(role) {
      if (role.id === ctrl.basedRoleId) { permissions = angular.copy(role.permissions); }
    });
    ctrl.newRole.permissions = permissions;
  };

  this.saveRole = function() {
    var promise;
    var successMsg = '';
    var errorMsg = '';
    ctrl.newRole.highlight_color = ctrl.newRole.highlight_color ? ctrl.newRole.highlight_color : undefined;
    ctrl.newRole.permissions.limits = ctrl.limiter.filter(function(limit) {
      return limit.interval && limit.maxInInterval;
    });
    if (ctrl.modifyingRole) {
      promise = Roles.update(ctrl.newRole).$promise;
      successMsg = ctrl.newRole.name + ' successfully updated.';
      errorMsg = 'There was an error updating the role ' + ctrl.newRole.name + '.';
    }
    else {
      promise = Roles.add(ctrl.newRole).$promise;
      successMsg = ctrl.newRole.name + ' successfully created.';
      errorMsg = 'There was an error creating the role ' + ctrl.newRole.name + '.';
    }
    promise
    .then(function() { Alert.success(successMsg); ctrl.pullPage(); })
    .catch(function() { Alert.error(errorMsg); })
    .finally(function() { ctrl.closeRole(); });
  };

  this.canViewAddUsersControl = function() {
    var view = false;
    if (ctrl.selectedRole.lookup !== 'banned') {
      if (ctrl.controlAccess.privilegedAddRoles && ctrl.controlAccess.privilegedAddRoles.samePriority) {
        view = ctrl.selectedRole.priority >= Session.user.permissions.priority;
      }
      else if (ctrl.controlAccess.privilegedAddRoles && ctrl.controlAccess.privilegedAddRoles.lowerPriority) {
        view = ctrl.selectedRole.priority > Session.user.permissions.priority;
      }
    }
    if (ctrl.showFilterUsers) { ctrl.showFilterUsers = view; }
    return view;
  };

  this.processUsers = function(userData) {
    if (userData && userData.users) {
      userData.users.forEach(function(user) {
        user.remove = false;
        if (ctrl.controlAccess.privilegedRemoveRoles && ctrl.controlAccess.privilegedRemoveRoles.samePriority) {
          user.remove = user.priority >= Session.user.permissions.priority;
        }
        else if (ctrl.controlAccess.privilegedRemoveRoles && ctrl.controlAccess.privilegedRemoveRoles.lowerPriority) {
          user.remove = user.priority > Session.user.permissions.priority;
        }
      });
    }
  };

  this.processUsers(this.userData);

  this.searchUsers = function() {
    if (!ctrl.searchStr || ctrl.searchStr && !ctrl.searchStr.length) {
      ctrl.clearSearch();
      return;
    }
    ctrl.queryParams.search = ctrl.searchStr;
    $location.search(ctrl.queryParams);
  };

  this.clearSearch = function() {
    ctrl.queryParams.search = undefined;
    $location.search(ctrl.queryParams);
    ctrl.searchStr = null;
  };

  this.addUsers = function() {
    var users = [];
    ctrl.usersToAdd.forEach(function(user) { users.push(user.text); });

    User.addRoles({ usernames: users, role_id: ctrl.roleId }).$promise
    .then(function() {
      Alert.success('Users successfully added to ' + ctrl.selectedRole.name + ' role.');
      ctrl.pullPage();
    })
    .catch(function(err) {
      var message = 'There was an error adding users to ' + ctrl.selectedRole.name + ' role.';
      if (err && err.data && err.data.message) { message = err.data.message; }
      Alert.error(message);
    })
    .finally(function() { ctrl.usersToAdd = null; });
  };

  this.removeUser = function(user) {
    User.removeRole({ user_id: user.id, role_id: ctrl.roleId }).$promise
    .then(function() {
      Alert.success('User ' + user.username + ' successfully removed from ' + ctrl.selectedRole.name + ' role.');
      ctrl.pullPage();
    })
    .catch(function(err) {
      var message = 'There was an error removing ' + user.username + ' from ' + ctrl.selectedRole.name + ' role.';
      if (err && err.data && err.data.message) { message = err.data.message; }
      Alert.error(message);
    });
  };

  this.loadTags = function(query) {
    return User.searchUsernames({ username: query }).$promise;
  };

  this.selectRole = function(role) {
    if (ctrl.modifyingRole || ctrl.roleToRemove || ctrl.roleToReset) { return; }
    // reset defaults when deselecting or reselecting
    ctrl.page = page;
    ctrl.limit = limit;
    ctrl.clearSearch();
    if (ctrl.selectedRole && ctrl.selectedRole.id === role.id) {
      ctrl.selectedRole = null;
      ctrl.userData = null;
      ctrl.editRole = null;
      ctrl.queryParams = {};
      $location.search(ctrl.queryParams);
    }
    else {
      ctrl.selectedRole = role;
      ctrl.queryParams = { roleId: role.id };
      $location.search(ctrl.queryParams);
    }
  };

  this.resetPriority = function() { ctrl.roles = angular.copy(ctrl.backupPriorities); };

  this.savePriority = function() {
    Roles.reprioritize(ctrl.roles).$promise
    .then(function() {
      Alert.success('Roles successfully reprioritized');
      ctrl.backupPriorities = angular.copy(ctrl.roles);
    })
    .catch(function() {
      Alert.error('There was an error reprioritizing the roles');
    });
  };

  this.reprioritizeRoles = function() {
    if (ctrl.controlAccess.reprioritize) {
      var priority = 0;
      ctrl.roles.forEach(function(role) {
        role.priority = priority++;
      });
    }
    else { ctrl.resetPriority(); }
  };

  // Reset role modal
  this.showResetRoleModal = false;
  this.roleToReset = null;
  this.showResetRole = function(resetRole) {
    ctrl.showResetRoleModal = true;
    ctrl.roleToReset = resetRole;
  };

  this.closeResetRole = function() {
    ctrl.roleToReset = null;
    ctrl.showResetRoleModal = false;
  };

  this.resetRole = function() {
    ctrl.roleToReset.permissions = ctrl.roleToReset.base_permissions;
    ctrl.roleToReset.highlight_color = ctrl.roleToReset.highlight_color ? ctrl.roleToReset.highlight_color : undefined;
    Roles.update(ctrl.roleToReset).$promise
    .then(function() {
      Alert.success('Role ' + ctrl.roleToReset.name + ' successfully reset.');
    })
    .catch(function(err) {
      var errMsg = 'There was an error resetting the role ' + ctrl.roleToReset.name + '.';
      if (err && err.data && err.data.message) { errMsg = err.data.message; }
      Alert.error(errMsg);
    })
    .finally(function() {
      ctrl.closeResetRole();
      ctrl.pullPage();
    });
  };

  // Remove role modal
  this.showRemoveRoleModal = false;
  this.roleToRemove = null;
  this.showRemoveRole = function(removeRole) {
    ctrl.showRemoveRoleModal = true;
    ctrl.roleToRemove = removeRole;
  };

  this.closeRemoveRole = function() {
    ctrl.roleToRemove = null;
    ctrl.showRemoveRoleModal = false;
  };

  this.removeRole = function() {
    if (ctrl.selectedRole && ctrl.roleToRemove.id === ctrl.selectedRole.id) {
      // deselect role being removed
      ctrl.selectedRole = null;
      ctrl.userData = null;
      ctrl.editRole = null;
      ctrl.queryParams = {};
      $location.search(ctrl.queryParams);
    }
    Roles.remove({ id: ctrl.roleToRemove.id }).$promise
    .then(function() {
      Alert.success('Role ' + ctrl.roleToRemove.name + ' successfully removed.');
    })
    .catch(function(err) {
      var errMsg = 'There was an error removing the role ' + ctrl.roleToRemove.name + '.';
      if (err && err.data && err.data.message) { errMsg = err.data.message; }
      Alert.error(errMsg);
    })
    .finally(function() {
      ctrl.closeRemoveRole();
      ctrl.pullPage();
    });
  };

  // Add/Edit role modal
  this.showRoleModal = false;
  this.selectedTab = null;
  this.showRole = function(editRole) {
    ctrl.showRoleModal = true;
    ctrl.selectedTab = 'general';
    if (editRole) {
      ctrl.modifyingRole = true;
      ctrl.newRole = angular.copy(editRole);
      ctrl.resetLimits(angular.copy(editRole.permissions.limits));
    }
    else { ctrl.newRole.priority = ctrl.maxPriority + 1; }
  };

  this.closeRole = function() {
    ctrl.modifyingRole = false;
    ctrl.showRoleModal = false;
    ctrl.basedRoleId = null;
    ctrl.newRole = {};
  };

  this.offLCS = $rootScope.$on('$locationChangeSuccess', function() {
    var params = $location.search();
    var page = Number(params.page) || 1;
    var limit = Number(params.limit) || 15;
    var search = params.search;
    var roleId = params.roleId;
    var roleIdChanged = false;
    var pageChanged = false;
    var searchChanged = false;
    var limitChanged = false;

    if (page && page !== ctrl.page) {
      pageChanged = true;
      ctrl.page = page;
    }
    if (limit && limit !== ctrl.limit) {
      limitChanged = true;
      ctrl.limit = limit;
    }
    if (roleId && roleId !== ctrl.roleId) {
      roleIdChanged = true;
      ctrl.roleId = roleId;
    }
    if (!roleId) { ctrl.roleId = null; } // allows deselection of role
    if ((search === undefined || search) && search !== ctrl.search) {
      searchChanged = true;
      ctrl.search = search;
    }

    if(pageChanged || limitChanged || roleIdChanged || searchChanged) { ctrl.pullPage(); }
  });
  $scope.$on('$destroy', function() { ctrl.offLCS(); });

  this.pullPage = function() {
    var query = {
      id: ctrl.roleId,
      page: ctrl.page,
      limit: ctrl.limit,
      search: ctrl.search
    };
    if (ctrl.roleId) {
      Roles.users(query).$promise
      .then(function(updatedUserData) {
        ctrl.processUsers(updatedUserData);
        ctrl.userData = updatedUserData;
        ctrl.pageCount = Math.ceil(updatedUserData.count / query.limit);
      });
    }
    Roles.all(query).$promise
    .then(function(pageData) {
      ctrl.roles = pageData.roles;
      ctrl.layouts = pageData.layouts;
      ctrl.init();
    });
  };

}];

module.exports = angular.module('ept.admin.management.roles.ctrl', [])
.controller('RolesCtrl', ctrl);
