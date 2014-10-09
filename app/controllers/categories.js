module.exports = ['$scope', '$q', '$route', '$http', '$rootScope', 'breadcrumbs',
  function($scope, $q, $route, $http, $rootScope, breadcrumbs) {
    // Initialization
    $http.get('/api/boards').success(function(categories) {
      $rootScope.breadcrumbs = breadcrumbs.get();
      $http.get('/api/boards/all').success(function(allBoards) {
        $scope.catListData = categories;
        $scope.boardListData = allBoards;
        $scope.nestableMap = {};
        $scope.editedBoards = {};
        $scope.movedBoards = {};
        $scope.newBoards = [];
        $scope.updatedCats = [];
      });
    });

    // 1) Create Boards which have been added
    $scope.processNewBoards = function() {
      console.log('1) Adding new Boards: \n' + JSON.stringify($scope.newBoards, null, 2));
      return $q.all(
        $scope.newBoards.map(function(newBoard) {
          return $http({
            url: '/api/boards',
            method: 'POST',
            data: {
              name: newBoard.name,
              description: newBoard.description
            }
          })
          .success(function(board) {
            console.log('Created New Board: ' + JSON.stringify(board));
            $scope.nestableMap[newBoard.dataId].id = board.id;
          });
        })
      );
    };

    // 2) Handle Boards which have been moved/reordered
    $scope.processMoveBoards = function() {
      return $q(function(resolve, reject) {
        console.log('2) Handling moved boards');
        console.log(JSON.stringify($scope.movedBoards, null, 2));
        resolve();
      });
    };

    // 3) Handle Boards which have been edited
    $scope.processEditedBoards = function() {
      return $q(function(resolve, reject) {
        var editedBoards = $scope.editedBoards;
        console.log('3) Handling edited boards');
        console.log(JSON.stringify(editedBoards, null, 2));

        // var updateBoard = function(board) {
        //   $http({
        //     url: '/api/boards',
        //     method: 'POST',
        //     data: {
        //       name: board.name,
        //       description: board.description
        //     }
        //   })
        //   .success(function(board) {
        //     console.log('Editing Board: ' + JSON.stringify(board));
        //     $scope.nestableMap[board.dataId].id = board.id;
        //   })
        //   .error(function(data) {
        //     reject(data);
        //   });
        // };

        // for (var key in editedBoards) {
        //   var board = editedBoards[key];

        // }
        resolve();
      });
    };

    // 3) Updated all Categories
    $scope.processCategories = function() {
      return $q(function(resolve, reject) {
        var updatedCats = $scope.updatedCats;
        console.log('4) Updating Categories: \n' + JSON.stringify(updatedCats, null, 2));
        $http({
          url: '/api/boards/categories',
          method: 'POST',
          data: {
            categories: updatedCats
          }
        })
        .success(function() {
          resolve();
        })
        .error(function(data) {
          reject(data);
        });
      });
    };

  }
];
