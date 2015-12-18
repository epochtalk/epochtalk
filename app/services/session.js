'use strict';
/* jslint node: true */
/* global angular */
var includes = require('lodash/collection/includes');
var get = require('lodash/object/get');

module.exports = ['$window',
  function($window) {
    var user = {};
    var authenticated = false;
    $window.privateStorage = {}; // fallback for safari private browser
    var hasLocalStorage = checkLocalStorage();
    var hasSessionStorage = checkSessionStorage();

     // Attempt to retrieve and auth user from session then local storage
     try {
      user = {
        id: $window.sessionStorage.id || $window.localStorage.id,
        username: $window.sessionStorage.username || $window.localStorage.username,
        avatar: $window.sessionStorage.avatar || $window.localStorage.avatar
      };
      if ($window.sessionStorage.roles || $window.localStorage.roles) {
        user.roles = JSON.parse($window.sessionStorage.roles || $window.localStorage.roles);
      }
      if ($window.sessionStorage.roles || $window.localStorage.roles) {
        user.moderating = JSON.parse($window.sessionStorage.roles || $window.localStorage.roles);
      }
      if ($window.sessionStorage.permissions || $window.localStorage.permissions) {
        user.permissions = JSON.parse($window.sessionStorage.permissions || $window.localStorage.permissions);
      }
      if ($window.sessionStorage.token || $window.localStorage.token) { authenticated = true; }
     }
     catch(err) { console.log('Error parsing user roles from session: ', err); }

    function checkLocalStorage() {
      var testKey = 'test';
      var storage = $window.localStorage;
      try {
        storage.setItem(testKey, '1');
        storage.removeItem(testKey);
        return true;
      }
      catch (error) { return false; }
    }

    function checkSessionStorage() {
      var testKey = 'test';
      var storage = $window.sessionStorage;
      try {
        storage.setItem(testKey, '1');
        storage.removeItem(testKey);
        return true;
      }
      catch (error) { return false; }
    }

    function setUser(newUser, useLocal) {
      authenticated = true;
      user.id = newUser.id;
      user.username = newUser.username;
      user.avatar = newUser.avatar || 'https://fakeimg.pl/400x400/ccc/444/?text=' + user.username;
      user.roles = newUser.roles || [];
      user.moderating = newUser.moderating || [];
      user.permissions = newUser.permissions || {};
      // token storage
      var storage;
      if (newUser.token && useLocal) {
        if (hasLocalStorage) { storage = $window.localStorage; }
        else { storage = $window.privateStorage; }
        storage.token = newUser.token;
        storage.id = user.id;
        storage.username = user.username;
        storage.avatar = user.avatar;
        storage.roles = JSON.stringify(user.roles);
        storage.moderating = JSON.stringify(user.moderating);
        storage.permissions = JSON.stringify(user.permissions);
      }
      else if (newUser.token) {
        if (hasSessionStorage) { storage = $window.sessionStorage; }
        else { storage = $window.privateStorage; }
        storage.token = newUser.token;
        storage.id = user.id;
        storage.username = user.username;
        storage.avatar = user.avatar;
        storage.roles = JSON.stringify(user.roles);
        storage.moderating = JSON.stringify(user.moderating);
        storage.permissions = JSON.stringify(user.permissions);
      }
    }

    function clearUser() {
      authenticated = false;
      delete user.id;
      delete user.username;
      delete user.avatar;
      delete user.roles;
      delete user.permissions;
      delete $window.sessionStorage.token;
      delete $window.localStorage.token;
      delete $window.privateStorage.token;

      delete $window.sessionStorage.id;
      delete $window.sessionStorage.username;
      delete $window.sessionStorage.avatar;
      delete $window.sessionStorage.roles;
      delete $window.sessionStorage.moderating;
      delete $window.sessionStorage.permissions;

      delete $window.localStorage.id;
      delete $window.localStorage.username;
      delete $window.localStorage.avatar;
      delete $window.localStorage.roles;
      delete $window.localStorage.moderating;
      delete $window.localStorage.permissions;

      delete $window.privateStorage.id;
      delete $window.privateStorage.username;
      delete $window.privateStorage.avatar;
      delete $window.privateStorage.roles;
      delete $window.privateStorage.moderating;
      delete $window.privateStorage.permissions;
    }

    function hasPermission(permission) {
      return user.permissions && get(user.permissions, permission);
    }

    function moderatesBoard(boardId) {
      return includes(user.moderating, boardId);
    }

    function globalModeratorCheck() {
      var globalMod = false;
      if (user.permissions) {
        var globalModPermissions = [
          'postControls.privilegedUpdate',
          'postControls.privilegedDelete',
          'postControls.privilegedPurge',
          'postControls.bypassLock',
          'threadControls.privilegedTitle',
          'threadControls.privilegedLock',
          'threadControls.privilegedSticky',
          'threadControls.privilegedMove',
          'threadControls.privilegedPurge',
          'pollControls.privilegedLock'
        ];
        // If user has any of the permissions above set to all they are a global mod
        globalModPermissions.forEach(function(permission) {
          var allPermission = get(user.permissions, permission + '.all');
          globalMod = globalMod || allPermission;
        });
      }
      return globalMod;
    }

    function getControlAccess(permission, boardId) {
      var result = {};
      var isMod = moderatesBoard(boardId);
      if (user.permissions) {
        var obj = get(user.permissions, permission);
        for (var key in obj) {
          if (typeof obj[key] === 'boolean') { result[key] = obj[key]; }
          else { result[key] = (isMod && obj[key].some) || obj[key].all; }
        }
      }
      return result;
    }

    function getModPanelControlAccess() {
      var result = {};
      if (user.permissions) {
        var perm = function(p) {
          p = get(user.permissions, p);
          p = p ? p : false; // change undefined to false
          return (typeof p === 'boolean') ? p : (p.some || p.all || p.samePriority || p.lowerPriority || false);
        };
        // Retrieve specific permissions used to display mod actions in moderation pages
        result.postControls = {
          privilegedDelete: perm('postControls.privilegedDelete'),
          privilegedUpdate: perm('postControls.privilegedUpdate'),
          privilegedPurge: perm('postControls.privilegedPurge'),
        };
        result.userControls = { privilegedBan: perm('profileControls.privilegedBan') };
        result.reportControls = hasPermission('reportControls');
        result.messageControls = hasPermission('messageControls');
      }
      return result;
    }

    function getControlAccessWithPriority(permission, othersPriority) {
      var result = {};
      if (user.permissions) {
        var authedPriority = user.permissions.priority;
        if (othersPriority === null || othersPriority === undefined) { othersPriority = Number.MAX_VALUE; }
        var obj = get(user.permissions, permission);
        for (var key in obj) {
          var samePriority = obj[key].samePriority;
          var lowerPriority = obj[key].lowerPriority;
          if (samePriority) { result[key] = authedPriority <= othersPriority; }
          else if (lowerPriority) { result[key] = authedPriority < othersPriority; }
          else { result[key] = obj[key]; }
        }
      }
      return result;
    }

    // Service API
    var serviceAPI = {
      setUser: setUser,
      clearUser: clearUser,
      hasPermission: hasPermission,
      moderatesBoard: moderatesBoard,
      globalModeratorCheck: globalModeratorCheck,
      getModPanelControlAccess: getModPanelControlAccess,
      getControlAccess: getControlAccess,
      getControlAccessWithPriority: getControlAccessWithPriority,
      user: user,
      getToken: function() {
        var localToken = $window.localStorage.token;
        var sessionToken = $window.sessionStorage.token;
        var privateToken = $window.privateStorage.token;
        return localToken || sessionToken || privateToken;
      },
      isAuthenticated: function() { return authenticated; },
      setUsername: function(username) { user.username = username; },
      setAvatar: function(avatar) { user.avatar = avatar; }
    };

    return serviceAPI;
  }
];
