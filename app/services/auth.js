'use strict';
/* jslint node: true */
/* global angular */

module.exports = ['$window', 'User', 'Session',
  function($window, User, Session) {
    // Service API
    var serviceAPI = {
      register: function(user, callback, error) {
        User.register(user, callback, error);
      },

      login: function(user, callback, error) {
        // get username and rememberMe
        var rememberMe = user.rememberMe;
        // Can't delete user.rememberMe without UI Flicker, copy user instead
        var userCopy = {};
        userCopy.username = user.username;
        userCopy.password = user.password;

        User.login(userCopy).$promise
        .then(function(resource) { Session.setUser(resource, rememberMe); })
        .then(callback)
        .catch(function(err) {
          Session.clearUser();
          error();
        });
      },

      logout: function(callback, error) {
        User.logout(null, callback, error).$promise
        .then(function() { Session.clearUser(); });
      },

      authenticate: function() {
        if (Session.getToken()) {
          User.ping().$promise
          .then(function(user) { Session.setUser(user); })
          .catch(function(err) { Session.clearUser(); });
        }
      }
    };

    serviceAPI.authenticate();
    return serviceAPI;
  }
];
