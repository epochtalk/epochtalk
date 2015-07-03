'use strict';
/* jslint node: true */
/* global angular */

module.exports = ['$window', 'USER_ROLES',
  function($window, USER_ROLES) {
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
      if (user.roles) {
        user.roles.forEach(function(role) {
          if (role.name === USER_ROLES.admin || role.name === USER_ROLES.superAdmin) { user.isAdmin = true; }
          if (role.name === USER_ROLES.mod || role.name === USER_ROLES.globalMod) { user.isMod = true; }
        });
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
      user.avatar = newUser.avatar || 'http://fakeimg.pl/400x400/ccc/444/?text=' + user.username;
      user.roles = newUser.roles || [];
      // user roles
      user.roles.forEach(function(role) {
        if (role.name === USER_ROLES.admin || role.name === USER_ROLES.superAdmin) { user.isAdmin = true; }
        if (role.name === USER_ROLES.mod || role.name === USER_ROLES.globalMod) { user.isMod = true; }
      });

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
      }
      else if (newUser.token) {
        if (hasSessionStorage) { storage = $window.sessionStorage; }
        else { storage = $window.privateStorage; }
        storage.token = newUser.token;
        storage.id = user.id;
        storage.username = user.username;
        storage.avatar = user.avatar;
        storage.roles = JSON.stringify(user.roles);
      }
    }

    function clearUser() {
      authenticated = false;
      delete user.id;
      delete user.username;
      delete user.avatar;
      delete user.roles;
      delete user.isAdmin;
      delete user.isMod;
      delete $window.sessionStorage.token;
      delete $window.localStorage.token;
      delete $window.privateStorage.token;

      delete $window.sessionStorage.id;
      delete $window.sessionStorage.username;
      delete $window.sessionStorage.avatar;
      delete $window.sessionStorage.roles;

      delete $window.localStorage.id;
      delete $window.localStorage.username;
      delete $window.localStorage.avatar;
      delete $window.localStorage.roles;

      delete $window.privateStorage.id;
      delete $window.privateStorage.username;
      delete $window.privateStorage.avatar;
      delete $window.privateStorage.roles;
    }

    // Service API
    var serviceAPI = {
      setUser: setUser,
      clearUser: clearUser,
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
