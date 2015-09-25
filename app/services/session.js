'use strict';
/* jslint node: true */
/* global angular */
var _ = require('lodash');

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
      delete $window.sessionStorage.permissions;

      delete $window.localStorage.id;
      delete $window.localStorage.username;
      delete $window.localStorage.avatar;
      delete $window.localStorage.roles;
      delete $window.localStorage.permissions;

      delete $window.privateStorage.id;
      delete $window.privateStorage.username;
      delete $window.privateStorage.avatar;
      delete $window.privateStorage.roles;
      delete $window.privateStorage.permissions;
    }

    function hasPermission(permission) {
      return user.permissions && _.get(user.permissions, permission);
    }

    // Service API
    var serviceAPI = {
      setUser: setUser,
      clearUser: clearUser,
      hasPermission: hasPermission,
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
