'use strict';
/* jslint node: true */
/* global angular */

module.exports = ['$window',
  function($window) {
    var user = {};
    var authenticated = false;
    $window.privateStorage = {}; // fallback for safari private browser
    var hasLocalStorage = checkLocalStorage();
    var hasSessionStorage = checkSessionStorage();

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
        if (role.name === 'Administrator') { user.isAdmin = true; }
      });

      user.roles.forEach(function(role) {
        if (role.name === 'Moderator' || role.name === 'Global Moderator') {
          user.isMod = true;
       }
      });

      // token storage
      var storage;
      if (newUser.token && useLocal) {
        if (hasLocalStorage) { storage = $window.localStorage; }
        else { storage = $window.privateStorage; }
        storage.token = newUser.token;
      }
      else if (newUser.token) {
        if (hasSessionStorage) { storage = $window.sessionStorage; }
        else { storage = $window.privateStorage; }
        storage.token = newUser.token;
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
