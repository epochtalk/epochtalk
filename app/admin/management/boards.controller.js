var remove = require('lodash/array/remove');
var Promise = require('bluebird');

module.exports = ['$location', '$stateParams', '$scope', '$q', '$anchorScroll', 'Alert', 'Boards', 'Categories', 'AdminUsers', 'AdminModerators', 'boards', 'categories',
  function($location, $stateParams, $scope, $q, $anchorScroll, Alert, Boards, Categories, AdminUsers, AdminModerators, boards, categories) {
    this.parent = $scope.$parent.AdminManagementCtrl;
    this.parent.tab = 'boards';
    var ctrl = this;
    // Category and Board Data
    $scope.catListData = categories; // Data backing left side of page
    $scope.boardListData = boards; // Data backing right side of page
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
        remove(boards, function(tempBoard) { return tempBoard.id === board.id; });
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
    $scope.openModeratorsModal = function(board) {
      ctrl.showModeratorsModal = true;
      ctrl.nestableBoard = board;
      ctrl.modBoard = angular.copy(board);
    };

    this.closeModerators = function() {
      ctrl.nestableBoard = null;
      ctrl.modBoard = null;
      ctrl.modsToAdd = [];
      ctrl.modsToRemove = [];
      ctrl.showModeratorsModal = false;
    };

    this.markModForRemoval = function(username) {
      this.modsToRemove.push(username);
      remove(ctrl.modBoard.moderators, function(user) { return user.username === username; });
    };

    this.saveModChanges = function() {
      ctrl.modsToAdd = ctrl.modsToAdd.map(function(tag) { return tag.text; });
      var error;
      // TODO: Optimize routes to accept multiple users
      // Remove this promise chain of user lookups
      Promise.each(ctrl.modsToAdd, function(username) {
        return AdminUsers.find({ username: username }).$promise
        .then(function(user) {
          return AdminModerators.add({ user_id: user.id, board_id: ctrl.modBoard.id }).$promise
          .then(function() {
            ctrl.nestableBoard.moderators.push({ username: user.username, id: user.id });
          })
          .catch(function(err) {
            error = err;
            Alert.error('There was an error adding ' + user.username + ' as a moderator');
          });
        });
      })
      .then(function() {
        return Promise.each(ctrl.modsToRemove, function(username) {
          return AdminUsers.find({ username: username }).$promise
          .then(function(user) {
            return AdminModerators.remove({ user_id: user.id, board_id: ctrl.modBoard.id }).$promise
            .then(function() {
              remove(ctrl.nestableBoard.moderators, function(oldMod) { return oldMod.username === user.username; });
            })
            .catch(function(err) {
              error = err;
              Alert.error('There was an error removing ' + user.username + ' from moderators');
            });
          });
        });
      })
      .then(function() {
        if (!error) {
          Alert.success('Moderators successfully updated');
        }
        ctrl.closeModerators();
      });
    };

    this.loadTags = function(query) {
      return AdminUsers.searchUsernames({ username: query }).$promise;
    };

    // 0) Create Categories which have been added
    $scope.processNewCategories = function() {
      console.log('0) Adding new Categories: \n' + JSON.stringify($scope.newCategories, null, 2));
      return $q.all($scope.newCategories.map(function(newCategory) {
        var dataId = newCategory.dataId;
        delete newCategory.dataId;
        return Categories.save(newCategory).$promise
        .then(function(category) {
          console.log('Created New Category: ' + JSON.stringify(category));
          $scope.nestableMap[dataId].id = category.id;
        })
        .catch(function(response) { console.log(response); });
      }));
    };

    // 1) Create Boards which have been added
    $scope.processNewBoards = function() {
      console.log('1) Adding new Boards: \n' + JSON.stringify($scope.newBoards, null, 2));
      return $q.all($scope.newBoards.map(function(newBoard) {
        var dataId = newBoard.dataId;
        delete newBoard.dataId;
        return Boards.save(newBoard).$promise
        .then(function(board) {
          console.log('Created New Board: ' + JSON.stringify(board));
          $scope.nestableMap[dataId].id = board.id;
        })
        .catch(function(response) { console.log(response); });
      }));
    };

    // 2) Handle Boards which have been edited
    $scope.processEditedBoards = function() {
      console.log('2) Handling edited boards: \n' + JSON.stringify($scope.editedBoards, null, 2));
      return $q.all($scope.editedBoards.map(function(editedBoard) {
        var board = { name: editedBoard.name, description: editedBoard.description };
        return Boards.update({ id: editedBoard.id }, board).$promise
        .catch(function(response) { console.log(response); });
      }));
    };

    // 3) Handle Boards which have been deleted
    $scope.processDeletedBoards = function() {
      console.log('3) Handling deleted boards: \n' + JSON.stringify($scope.deletedBoards, null, 2));
      return $q.all($scope.deletedBoards.map(function(deletedBoard) {
        return Boards.delete({ id: deletedBoard }).$promise
        .catch(function(response) { console.log(response); });
      }));
    };

    // 4) Handle Categories which have been deleted
    $scope.processDeletedCategories = function() {
      console.log('4) Handling deleted categories: \n' + JSON.stringify($scope.deletedCategories, null, 2));
      return $q.all($scope.deletedCategories.map(function(deletedCategory) {
        return Categories.delete({ id: deletedCategory }).$promise
        .catch(function(response) { console.log(response); });
      }));
    };

    // 5) Updated all Categories
    $scope.processCategories = function(boardMapping) {
      console.log('5) Updating board mapping: \n' + JSON.stringify(boardMapping, null, 2));
      return Boards.updateCategories({ boardMapping: boardMapping }).$promise
      .catch(function(response) { console.log(response); });
    };

  }
];

module.exports = angular.module('ept.admin.management.boards.ctrl', [])
.controller('CategoriesCtrl', ctrl)
.name;
