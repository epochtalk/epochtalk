var _ = require('lodash');

module.exports = ['$scope', '$q', 'Boards', 'boards', 'categories',
  function($scope, $q, Boards, boards, categories) {
    this.parent = $scope.$parent;
    this.parent.tab = 'boards';

    // Initialization
    $scope.catListData = categories;
    $scope.boardListData = [];
    $scope.nestableMap = {};
    $scope.editedBoards = {};
    $scope.newBoards = [];
    $scope.updatedCats = [];

    function cleanBoardList() {
      categories.forEach(function(cat) {
        return cleanBoards(cat.boards);
      });
      $scope.boardListData = boards;
    }

    function cleanBoards(catBoards) {
      catBoards.forEach(function(board) {
        // remove this board from boardListData
        _.remove(boards, function(tempBoard) {
          return tempBoard.id === board.id;
        });

        if (board.children.length > 0) {
          cleanBoards(board.children);
        }
      });
    }

    cleanBoardList();


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
        .catch(function(response) { console.log(response); });
      }));
    };

    // 2) Handle Boards which have been edited
    $scope.processEditedBoards = function() {
      console.log('2) Handling edited boards: \n' + JSON.stringify($scope.editedBoards, null, 2));
      return $q.all(_.map($scope.editedBoards, function(editedBoard, key) {
        return Boards.update({ id: key }, editedBoard).$promise
        .catch(function(response) { console.log(response); });
      }));
    };

    // 3) Updated all Categories
    $scope.processCategories = function() {
      console.log('3) Updating Categories: \n' + JSON.stringify($scope.updatedCats, null, 2));
      return Boards.updateCategories({ categories: $scope.updatedCats }).$promise
      .catch(function(response) { console.log(response); });
    };

  }
];
