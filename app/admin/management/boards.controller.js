var _ = require('lodash');

module.exports = ['$location', '$stateParams', '$scope', '$q', '$anchorScroll', 'Alert', 'Boards', 'Categories', 'boards', 'categories',
  function($location, $stateParams, $scope, $q, $anchorScroll, Alert, Boards, Categories, boards, categories) {
    this.parent = $scope.$parent.AdminManagementCtrl;
    this.parent.tab = 'boards';
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
        _.remove(boards, function(tempBoard) { return tempBoard.id === board.id; });
        // recurse if there are children
        if (board.children.length > 0) { cleanBoards(board.children); }
      });
    }

    cleanBoardList();

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
