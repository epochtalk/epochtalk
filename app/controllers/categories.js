var _ = require('lodash');

module.exports = ['$scope', '$q', '$route', '$rootScope', 'Boards', 'breadcrumbs',
  function($scope, $q, $route, $rootScope, Boards, breadcrumbs) {

    // Initialization
    var boardCategories;
    Boards.query().$promise
    .then(function(categories) {
      $rootScope.breadcrumbs = breadcrumbs.get();
      boardCategories = categories;
      return Boards.all().$promise;
    })
    .then(function(allBoards) {
      $scope.catListData = boardCategories;
      $scope.boardListData = allBoards;
      $scope.nestableMap = {};
      $scope.editedBoards = {};
      $scope.movedBoards = {};
      $scope.newBoards = [];
      $scope.updatedCats = [];
    });

    // 1) Create Boards which have been added
    $scope.processNewBoards = function() {
      console.log('1) Adding new Boards: \n' + JSON.stringify($scope.newBoards, null, 2));
      return $q.all($scope.newBoards.map(function(newBoard) {
        var dataId = newBoard.dataId;
        delete newBoard.dataId;
        console.log(newBoard);
        return Boards.save(newBoard).$promise
        .then(function(board) {
          console.log('Created New Board: ' + JSON.stringify(board));
          $scope.nestableMap[dataId].id = board.id;
        })
        .catch(function(response) {
          console.log(response);
        });
      }));
    };

    // 2) Handle Boards which have been moved/reordered
    $scope.processMoveBoards = function() {
      return $q(function(resolve) {
        console.log('2) Handling moved boards');
        console.log(JSON.stringify($scope.movedBoards, null, 2));
        resolve();
      });
    };

    // 3) Handle Boards which have been edited
    $scope.processEditedBoards = function() {
      console.log('3) Handling edited boards: \n' + JSON.stringify($scope.editedBoards, null, 2));
      return $q.all(_.map($scope.editedBoards, function(editedBoard, id) {
        return Boards.update({ id: id }, editedBoard).$promise
        .catch(function(response) {
          console.log(response);
        });
      }));
    };

    // 3) Updated all Categories
    $scope.processCategories = function() {
      console.log('4) Updating Categories: \n' + JSON.stringify($scope.updatedCats, null, 2));
      return Boards.updateCategories({ categories: $scope.updatedCats }).$promise
      .catch(function(response) {
        console.log(response);
      });
    };

  }
];
