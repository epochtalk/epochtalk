'use strict';
/* jslint node: true */
/* global angular */

module.exports = ['$location', '$window', 'User',
  function($location, $window, User) {
    var getUser = function() {
      var username;
      if ($window.sessionStorage.username) {
        username = $window.sessionStorage.username;
      }
      else if ($window.localStorage.username) {
        username = $window.localStorage.username;
      }
      return username;
    };

    var setUser = function(username) {
      if ($window.sessionStorage.username) {
        $window.sessionStorage.username = username;
      }
      else if ($window.localStorage.username) {
        $window.localStorage.username = username;
      }
    };

    var clearUser = function() {
      delete $window.sessionStorage.token;
      delete $window.sessionStorage.username;
      delete $window.sessionStorage.userId;
      delete $window.localStorage.token;
      delete $window.localStorage.username;
      delete $window.localStorage.userId;
    };

    var saveUserLocal = function(resource) {
      $window.localStorage.token = resource.token;
      $window.localStorage.username = resource.username;
      $window.localStorage.userId = resource.userId;
    };

    var saveUserSession = function(resource) {
      $window.sessionStorage.token = resource.token;
      $window.sessionStorage.username = resource.username;
      $window.sessionStorage.userId = resource.userId;
    };

    return {
      register: function(user, callback, error) {
        // get username
        User.register(user, callback, error).$promise
        .then(function(resource) {
          saveUserSession(resource);
        })
        .catch(function(err) {
          clearUser();
        });
      },

      login: function(user, callback, error) {
        // get username and rememberMe
        var rememberMe = user.rememberMe;
        // Can't delete user.rememberMe without UI Flicker, copy user instead
        var userCopy = {};
        userCopy.username = user.username;
        userCopy.password = user.password;

        User.login(userCopy, callback, error).$promise
        .then(function(resource) {
          if (rememberMe) { saveUserLocal(resource); }
          else { saveUserSession(resource); }
        })
        .catch(function(err) {
          clearUser();
        });
      },

      logout: function(callback, error) {
        User.logout(null, callback, error).$promise
        .then(function() {
          clearUser();
        });
      },

      checkAuthentication: function() { User.ping(); },

      isAuthenticated: function() {
        var authenticated = false;
        if ($window.sessionStorage.token || $window.localStorage.token) {
          authenticated = true;
        }
        return authenticated;
      },

      currentUser: function() { return getUser(); },
      setUser: setUser,

      checkUsername: function(username, callback, error) {
        User.checkUsername({ username: username }, callback, error);
      },

      checkEmail: function(email, callback, error) {
        User.checkEmail({ email: email }, callback, error);
      }

      // changePassword: function(email, oldPassword, newPassword, callback) {
      //   var cb = callback || angular.noop;
      //   User.update({
      //     email: email,
      //     oldPassword: oldPassword,
      //     newPassword: newPassword
      //   }, function(user) {
      //       console.log('password changed');
      //       return cb();
      //   }, function(err) {
      //       return cb(err.data);
      //   });
      // }

      // removeUser: function(email, password, callback) {
      //   var cb = callback || angular.noop;
      //   User.delete({
      //     email: email,
      //     password: password
      //   }, function(user) {
      //       console.log(user + 'removed');
      //       return cb();
      //   }, function(err) {
      //       return cb(err.data);
      //   });
      // }
    };
  }
];
