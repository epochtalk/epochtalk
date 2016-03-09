var rem = require('lodash/remove');
var get = require('lodash/get');
var some = require('lodash/some');
var filter = require('lodash/filter');
var Promise = require('bluebird');

var ctrl = ['$timeout', '$location', '$stateParams', '$scope', '$q', '$anchorScroll', 'Alert', 'AdminBoards', 'Boards', 'Categories', 'AdminUsers', 'AdminModerators', 'boards', 'categories', 'roleData',
  function($timeout, $location, $stateParams, $scope, $q, $anchorScroll, Alert, AdminBoards, Boards, Categories, AdminUsers, AdminModerators, boards, categories, roleData) {
    this.parent = $scope.$parent.AdminManagementCtrl;
    this.parent.tab = 'boards';
    var ctrl = this;
    // Category and Board Data
    $scope.catListData = categories; // Data backing left side of page
    $scope.boardListData = boards; // Data backing right side of page
    $scope.roles = roleData.roles;
    // Category and Board reference map
    $scope.nestableMap = {};
    // New/Edited/Deleted Boards
    $scope.newBoards = [];
    $scope.editedBoards = [];
    $scope.deletedBoards = [];
    // New/Deleted Categories
    $scope.newCategories = [];
    $scope.deletedCategories = [];

    // temporary hack to get save alert working
    if ($stateParams.saved === 'true') { // string compare to query string
      $location.search({});
      Alert.success('Boards successfully saved.');
    }
    $anchorScroll();

    function cleanBoardList() {
      categories.forEach(function(cat) { return cleanBoards(cat.boards); });
      $scope.boardListData = boards;
    }

    function cleanBoards(catBoards) {
      catBoards.forEach(function(board) {
        // remove this board from boardListData
        rem(boards, function(tempBoard) { return tempBoard.id === board.id; });
        // recurse if there are children
        if (board.children.length > 0) { cleanBoards(board.children); }
      });
    }

    cleanBoardList();

    this.showModeratorsModal = false;
    this.nestableBoard = null;
    this.modBoard = null;
    this.modsToRemove = [];
    this.modsToAdd = [];
    this.usersWithBadPermissions = [];
    $scope.openModeratorsModal = function(board) {
      ctrl.showModeratorsModal = true;
      ctrl.nestableBoard = board;
      ctrl.modBoard = angular.copy(board);
    };

    this.closeModerators = function() {
      ctrl.showModeratorsModal = false;
      $timeout(function() {
        ctrl.nestableBoard = null;
        ctrl.modBoard = null;
        ctrl.modsToAdd = [];
        ctrl.modsToRemove = [];
        ctrl.usersWithBadPermissions = [];
      }, 200);
    };

    this.markModForRemoval = function(username) {
      this.modsToRemove.push(username);
      rem(ctrl.modBoard.moderators, function(user) { return user.username === username; });
    };

    this.checkPermissions = function(mods) {
      // check that the user has at least one of these permissions set
      var modPermissions = [
        'boards.viewUncategorized',
        'posts.privilegedUpdate',
        'posts.privilegedDelete',
        'posts.privilegedPurge',
        'posts.viewDeleted',
        'posts.bypassLock',
        'threads.privilegedTitle',
        'threads.privilegedLock',
        'threads.privilegedSticky',
        'threads.privilegedMove',
        'threads.privilegedPurge',
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
      ctrl.modsToAdd = ctrl.modsToAdd.map(function(tag) { return tag.text; });
      var removeParams = { usernames: ctrl.modsToRemove, board_id: ctrl.modBoard.id };
      var addParams = { usernames: ctrl.modsToAdd, board_id: ctrl.modBoard.id };
      if (ctrl.modsToAdd.length && ctrl.modsToRemove.length) { // Add and Remove mods
        AdminModerators.remove(removeParams).$promise
        .then(function(users) {
          return Promise.each(users, function(user) {
            rem(ctrl.nestableBoard.moderators, function(oldMod) { return oldMod.username === user.username; });
          })
          .then(function() { Alert.success('Moderators successfully removed'); });
        })
        .then(function() {
          return AdminModerators.add(addParams).$promise
          .then(function(users) {
            return Promise.each(users, function(user) {
              ctrl.nestableBoard.moderators.push({ username: user.username, id: user.id });
            })
            .then(function() { return ctrl.checkPermissions(users); })
            .then(function(badPermissionUsers) { ctrl.usersWithBadPermissions = badPermissionUsers; })
            .then(function() { Alert.success('Moderators successfully added'); });
          });
        })
        .catch(function() { Alert.error('There was an error updating moderators'); })
        .finally(function() {
          if (!ctrl.usersWithBadPermissions || !ctrl.usersWithBadPermissions.length) { ctrl.closeModerators(); }
        });
      }
      else if (ctrl.modsToAdd.length && !ctrl.modsToRemove.length) { // Add Mods only
        AdminModerators.add(addParams).$promise
        .then(function(users) {
          return Promise.each(users, function(user) {
            ctrl.nestableBoard.moderators.push({ username: user.username, id: user.id });
          })
          .then(function() { return ctrl.checkPermissions(users); })
          .then(function(badPermissionUsers) { ctrl.usersWithBadPermissions = badPermissionUsers; })
          .then(function() { Alert.success('Moderators successfully added'); });
        })
        .catch(function() { Alert.error('There was an error adding moderators'); })
        .finally(function() {
          if (!ctrl.usersWithBadPermissions || !ctrl.usersWithBadPermissions.length) { ctrl.closeModerators(); }
        });
      }
      else { // Remove mods only
        AdminModerators.remove(removeParams).$promise
        .then(function(users) {
          return Promise.each(users, function(user) {
            rem(ctrl.nestableBoard.moderators, function(oldMod) { return oldMod.username === user.username; });
          })
          .then(function() { Alert.success('Moderators successfully removed'); });
        })
        .catch(function() { Alert.error('There was an error removing users from moderators'); })
        .finally(function() { ctrl.closeModerators(); });
      }
    };

    this.loadTags = function(query) {
      return AdminUsers.searchUsernames({ username: query }).$promise;
    };

    // 0) Create Categories which have been added
    $scope.processNewCategories = function() {
      if ($scope.newCategories.length < 1) { return $q.resolve(); }
      console.log('0) Adding new Categories: \n' + JSON.stringify($scope.newCategories, null, 2));

      return Categories.save($scope.newCategories).$promise
      .then(function(cats) {
        // append all the new cats back on to the page
        cats.forEach(function(cat, index) {
          var dataId = $scope.newCategories[index].dataId;
          $scope.nestableMap[dataId].id = cat.id;
        });
      })
      .then(function() {
        while($scope.newCategories.length > 0) { $scope.newCategories.pop(); }
      })
      .catch(function(err) { console.log(err); });
    };

    // 1) Create Boards which have been added
    $scope.processNewBoards = function() {
      if ($scope.newBoards.length < 1) { return $q.resolve(); }
      console.log('1) Adding new Boards: \n' + JSON.stringify($scope.newBoards, null, 2));

      return Boards.save($scope.newBoards).$promise
      .then(function(boards) {
        // append all the new boards back on to the page
        boards.forEach(function(board, index) {
          var dataId = $scope.newBoards[index].dataId;
          $scope.nestableMap[dataId].id = board.id;
        });
      })
      .then(function() {
        while($scope.newBoards.length > 0) { $scope.newBoards.pop(); }
      })
      .catch(function(err) { console.log(err); });
    };

    // 2) Handle Boards which have been edited
    $scope.processEditedBoards = function() {
      if ($scope.editedBoards.length < 1) { return $q.resolve(); }
      console.log('2) Handling edited boards: \n' + JSON.stringify($scope.editedBoards, null, 2));

      return Boards.update($scope.editedBoards).$promise
      .then(function() {
        while($scope.editedBoards.length > 0) { $scope.editedBoards.pop(); }
      })
      .catch(function(err) { console.log(err); });
    };

    // 3) Handle Boards which have been deleted
    $scope.processDeletedBoards = function() {
      if ($scope.deletedBoards.length < 1) { return $q.resolve(); }
      console.log('3) Handling deleted boards: \n' + JSON.stringify($scope.deletedBoards, null, 2));

      return Boards.delete($scope.deletedBoards).$promise
      .then(function() {
        while($scope.deletedBoards.length > 0) { $scope.deletedBoards.pop(); }
      })
      .catch(function(err) { console.log(err); });
    };

    // 4) Handle Categories which have been deleted
    $scope.processDeletedCategories = function() {
      if ($scope.deletedCategories.length < 1) { return $q.resolve(); }
      console.log('4) Handling deleted categories: \n' + JSON.stringify($scope.deletedCategories, null, 2));

      return Categories.delete($scope.deletedCategories).$promise
      .then(function() {
        while($scope.deletedCategories.length > 0) { $scope.deletedCategories.pop(); }
      })
      .catch(function(err) { console.log(err); });
    };

    // 5) Updated all Categories
    $scope.processCategories = function(boardMapping) {
      // console.log('5) Updating board mapping: \n' + JSON.stringify(boardMapping, null, 2));
      return AdminBoards.updateCategories({ boardMapping: boardMapping }).$promise
      .catch(function(response) { console.log(response); });
    };

  }
];

module.exports = angular.module('ept.admin.management.boards.ctrl', [])
.controller('CategoriesCtrl', ctrl)
.name;
