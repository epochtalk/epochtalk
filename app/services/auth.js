'use strict';
/* jslint node: true */
/* global angular */

module.exports = ['$location', '$rootScope', '$http', '$window', 'User',
  function($location, $rootScope, $http, $window, User) {
    return {
      login: function(user, callback, error) {
        // get username and rememberMe
        var username = user.username;
        var rememberMe = user.rememberMe;
        delete user.rememberMe;

        User.login(user, callback, error).$promise
        .then(function(resource) {
          var token = resource.token;
          if (rememberMe) {
            $window.localStorage.token = token;
            $window.localStorage.username = username;
          }
          else {
            $window.sessionStorage.token = token;
            $window.sessionStorage.username = username;
          }
        })
        .catch(function(err) {
          // delete storage keys
          delete $window.sessionStorage.token;
          delete $window.sessionStorage.username;
          delete $window.localStorage.token;
          delete $window.localStorage.username;
        });
      },

      register: function( user, callback) {
        User.register(user);
      },

      logout: function(callback) {
        var cb = callback || angular.noop;
        // delete key from session storage
        delete $window.sessionStorage.token;
        delete $window.sessionStorage.username;
        delete $window.localStorage.token;
        delete $window.localStorage.username;
        return cb();
      },

      isAuthenticated: function(callback) {
        var cb = callback || angular.noop;

        // TODO: query the backend to check auth state?

        var authenticated = false;
        if ($window.sessionStorage.token ||
            $window.localStorage.token) {
          authenticated = true;
        }
        return cb(authenticated);
      },

      currentUser: function() {
        // check if key exists in storage
        var username;

        if ($window.sessionStorage.username) {
          username = $window.sessionStorage.username;
        }
        else if ($window.localStorage.username) {
          username = $window.localStorage.username;
        }

        $rootScope.currentUser = username;
        return username;
      },

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

      // createUser: function(userinfo, callback) {
      //   var cb = callback || angular.noop;
      //   User.save(userinfo,
      //     function(user) {
      //       $rootScope.currentUser = user;
      //       return cb();
      //     },
      //     function(err) {
      //       return cb(err.data);
      //     });
      // },

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
