var get = require('lodash/get');
var some = require('lodash/some');
var rem = require('lodash/remove');
var filter = require('lodash/filter');
var intersection = require('lodash/intersection');

var directive = ['Moderators', 'User', 'Alert', '$timeout', '$q',
function(Moderators, User, Alert, $timeout, $q) {
  return {
    restrict: 'E',
    scope: true,
    bindToController: { board: '=', show: '=' },
    template: require('./set-moderators.html'),
    controllerAs: 'vm',
    controller: ['$scope', function($scope) {
      var ctrl = this;

      this.modsToAdd = [];
      this.modsToRemove = [];
      this.usersWithBadPermissions = [];
      this.mods = [];

      $scope.$watch(function() { return ctrl.board; }, function(newValue) {
        if (newValue) { ctrl.mods = angular.copy(ctrl.board.moderators); }
      });

      this.closeModerators = function() {
        $timeout(function() {
          ctrl.modsToAdd = [];
          ctrl.modsToRemove = [];
          ctrl.usersWithBadPermissions = [];
          ctrl.show = false;
        }, 200);
      };

      this.markModForRemoval = function(username) {
        this.modsToRemove.push(username);
        rem(ctrl.mods, function(thisMod) { return thisMod.username === username; });
      };

      this.checkPermissions = function(mods) {
        // check that the user has at least one of these permissions set
        var modPermissions = [
          'boards.update.allow',
          'posts.update.bypass',
          'posts.delete.bypass',
          'posts.purge.bypass',
          'posts.find.bypass',
          'posts.create.bypass',
          'threads.title.bypass',
          'threads.createPoll.bypass.owner.admin',
          'threads.editPoll.bypass.owner.admin',
          'threads.lockPoll.bypass.owner.admin',
          'threads.lock.bypass.owner.admin',
          'threads.move.bypass.owner.admin',
          'threads.purge.bypass.owner.admin',
          'threads.sticky.bypass.owner.admin',
          'threads.title.bypass.owner.admin'
        ];
        return filter(mods.map(function(mod) {
          var hasSomeModePrivileges = some(mod.roles.map(function(role) {
            var hasModPermission = false;
            modPermissions.forEach(function(perm) {
              if (get(role.permissions, perm)) { hasModPermission = true; }
            });
            return hasModPermission;
          }));
          return hasSomeModePrivileges ? undefined : mod.username;
        }), undefined);
      };

      this.saveModChanges = function() {
        // figure out which are duplicates
        ctrl.modsToAdd = ctrl.modsToAdd.map(function(tag) { return tag.text; });
        var inter = intersection(ctrl.modsToAdd, ctrl.modsToRemove);
        inter.forEach(function(interName) {
          rem(ctrl.modsToAdd, function(name) { return name === interName; });
          rem(ctrl.modsToRemove, function(name) { return name === interName; });
        });

        // build save params
        var addParams = { usernames: ctrl.modsToAdd, board_id: ctrl.board.id };
        var removeParams = { usernames: ctrl.modsToRemove, board_id: ctrl.board.id };

        // remove moderators if needed
        return $q(function(resolve) {
          if (!ctrl.modsToRemove.length) { return resolve(); }

          var promise = Moderators.remove(removeParams).$promise
          .then(function(users) {
            return users.map(function(user) {
              rem(ctrl.board.moderators, function(mod) { return mod.username === user.username; });
            });
          });
          return resolve(promise);
        })
        // add moderators if needed
        .then(function() {
          if (!ctrl.modsToAdd.length) { return; }
          return Moderators.add(addParams).$promise
          .then(function(users) {
            users.forEach(function(user) {
              ctrl.board.moderators.push({ username: user.username, id: user.id });
            });
            return users;
          })
          .then(function(users) { return ctrl.checkPermissions(users); })
          .then(function(bpUsers) { ctrl.usersWithBadPermissions = bpUsers; });
        })
        .then(function() { ctrl.mods = angular.copy(ctrl.board.moderators); })
        .then(function() { Alert.success('Moderators successfully updated'); })
        .catch(function() { Alert.error('There was an error updating moderators'); })
        .finally(function() {
          if (!ctrl.usersWithBadPermissions.length) { ctrl.closeModerators(); }
        });
      };

      this.loadTags = function(query) {
        return User.searchUsernames({ username: query }).$promise;
      };
    }]
  };
}];

module.exports = angular.module('ept.directives.set-moderators', [])
.directive('setModerators', directive);
