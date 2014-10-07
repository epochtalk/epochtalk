var _ = require('lodash');

module.exports = ['$scope', '$q', '$route', '$http', '$rootScope', 'breadcrumbs',
  function($scope, $q, $route, $http, $rootScope, breadcrumbs) {
    // Initialization
    $http.get('/api/boards').success(function(categories) {
      $rootScope.breadcrumbs = breadcrumbs.get();
      $http.get('/api/boards/all').success(function(allBoards) {
        $scope.catListData = categories;
        $scope.catListOpts = { protectRoot: true, maxDepth: 5, group: 1 };
        $scope.catListId = 'categorized-boards';
        $scope.boardListData = allBoards;
        $scope.boardListOpts = { protectRoot: true, maxDepth: 4, group: 1 };
        $scope.boardListId = 'uncategorized-boards';
        $scope.nestableMap = {};
        $scope.listElements = {};
        $scope.newBoards = [];
      });
    });

    // Save Changes
    $scope.save = function() {
      var serializedCats;
      return createNewBoards() // 1) Create new boards
      .then(function() {
        var catList = $scope.listElements[$scope.catListId];
        var boardList = $scope.listElements[$scope.boardListId];
        serializedCats = catList.nestable('serialize');
        var serializedBoards = boardList.nestable('serialize');
        var movedBoards = buildMovedBoardsHash(serializedCats);
        movedBoards = buildMovedBoardsHash(serializedBoards, movedBoards);
        // 2) Handle Boards which have been moved/reordered
        return processMoveBoards(movedBoards);
      })
      .then(function() {
        // 3) Updated all Categories
        console.log(serializedCats);
        var updatedCats = buildUpdatedCats(serializedCats);
        return updateCategories(updatedCats);
      })
      .then(function() {
        console.log('Done Saving!');
        $route.reload();
      });
    };

    // Expands all Categories/Boards
    $scope.expandAll = function() {
      $('#' + $scope.catListId).nestable('expandAll');
    };

    // Collapses all Categories/Boards
    $scope.collapseAll = function() {
      $('#' + $scope.catListId).nestable('collapseAll');
    };

    $scope.reset = function() {
      $route.reload();
    };

    $scope.insertNewBoard = function() {
      var board = {
        name: $scope.newBoardName || '',
        description: $scope.newBoardDesc || ''
      };
      $scope.$broadcast('insertNewBoard', {
        newBoard: board,
        listId: $scope.boardListId
      });
      $scope.closeModal('#add-new-board');
      $scope.newBoardName = '';
      $scope.newBoardDesc = '';
    };

    $scope.insertNewCategory = function() {
      $scope.$broadcast('insertNewCategory', {
          newCatName: $scope.newCatName || '',
          listId: $scope.catListId
      });
      $scope.newCatName = '';
    };

    $scope.closeModal = function(modalId) {
      $(modalId).foundation('reveal', 'close');
    };

    // Translates serialized array into boards.updateCategory format
    var buildUpdatedCats = function(catsArr) {
      var updatedCats = [];
      catsArr.forEach(function(item) {
        var cat = {
          name: item.name,
          board_ids: []
        };
        if (item.children) {
          item.children.forEach(function(child) {
            cat.board_ids.push($scope.nestableMap[child.id].id);
          });
        }
        updatedCats.push(cat);
      });
      return updatedCats;
    };

    // Recursively builds a hashmap of moved boards
    var buildMovedBoardsHash = function(boardsArr, movedBoards) {
      if (!boardsArr) { return; }
      movedBoards = movedBoards || {};
      boardsArr.forEach(function(item) {
        var newChildrenIds = [];
        var board = $scope.nestableMap[item.id]; // original board object
        item.children = item.children || [];
        item.children.forEach(function(childItem) {
          var childBoard = $scope.nestableMap[childItem.id];
          newChildrenIds.push(childBoard.id);
        });
        // If arrays are not equal, a change has occured
        if(!_.isEqual(board.children_ids, newChildrenIds)) {
          var removedChildren = _.difference(board.children_ids, newChildrenIds);
          var addedChildren = _.difference(newChildrenIds, board.children_ids);
          removedChildren.forEach(function(removedChild) {
            movedBoards[removedChild] = movedBoards[removedChild] || {};
            movedBoards[removedChild].oldParent = board.id || '';
            if (movedBoards[removedChild].oldParent === '' && movedBoards[removedChild].newParent === '') {
              delete movedBoards[removedChild];
            }
          });
          addedChildren.forEach(function(addedChild) {
            movedBoards[addedChild] = movedBoards[addedChild] || {};
            movedBoards[addedChild].newParent = board.id || '';
            if (movedBoards[addedChild].oldParent === '' && movedBoards[addedChild].newParent === '') {
              delete movedBoards[addedChild];
            }
          });
          // Ordering change for non top level boards (Update Board children_ids order)
          // Top level ordering is handled by updateCategories, parent boards children_ids
          // array must be updated to fix ordering of child boards.
          if (!removedChildren.length && !addedChildren.length && board.id) {
            console.log('Reordering: ' + JSON.stringify(board));
            $http({
              url: '/api/boards/' + board.id,
              method: 'POST',
              data: {
                children_ids: newChildrenIds
              }
            })
            .success(function(board) {
              console.log('Reordered To: ' + JSON.stringify(board));
            });
          }
        }
        buildMovedBoardsHash(item.children, movedBoards);
      });
      for (var key in movedBoards) { // Remove boards without an old parent
        if (!movedBoards[key].oldParent && movedBoards[key].newParent === '') {
          delete movedBoards[key];
        }
      }
      return movedBoards;
    };

    // 1) Create Boards which have been added
    var createNewBoards = function() {
      return $q(function(resolve, reject) {
        if (!$scope.newBoards.length) { resolve(); }
        console.log('1) Adding new Boards: \n' + JSON.stringify($scope.newBoards, null, 2));
        var remaining = $scope.newBoards.length;
        $scope.newBoards.forEach(function(newBoard) {
          $http({
            url: '/api/boards',
            method: 'POST',
            data: {
              name: newBoard.name,
              description: newBoard.description
            }
          })
          .success(function(board) {
            console.log('Created New Board: ' + JSON.stringify(board));
            remaining--;
            $scope.nestableMap[newBoard.dataId].id = board.id;
            if (remaining === 0) {
              resolve();
            }
          })
          .error(function(data) {
            reject(data);
          });
        });
      });
    };

    // 2) Handle Boards which have been moved/reordered
    var processMoveBoards = function(movedBoards) {
      return $q(function(resolve, reject) {
        console.log('2) Handling moved boards');
        console.log(JSON.stringify(movedBoards, null, 2));
        resolve();
      });
    };

    // 3) Updated all Categories
    var updateCategories = function(updatedCats) {
      return $q(function(resolve, reject) {
        console.log('3) Updating Categories: \n' + JSON.stringify(updatedCats, null, 2));
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

    var deleteDataId = '';
    var editCatDataId = '';
    $scope.editCatName = '';
    var editBoardDataId = '';
    var editBoardId = '';
    $scope.editBoardName = '';
    $scope.editBoardDesc = '';
    // Sets the item being deleted
    $scope.setDelete = function(dataId) {
      deleteDataId = dataId;
    };

    $scope.confirmDelete = function() {
      $scope.$broadcast('confirmDelete', {
        dataId: deleteDataId
      });

      deleteDataId = '';
      $scope.closeModal('#delete-confirm');
    };

    // Sets the category being edited
    $scope.setEditCat = function(dataId) {
      var editCat = $scope.nestableMap[dataId];
      editCatDataId = dataId;
      $scope.editCatName = editCat.name;
    };

    // Edits the set category
    $scope.editCategory = function() {
      $scope.$broadcast('editCategory', {
        newCatName: $scope.editCatName,
        dataId: editCatDataId,
        listId: $scope.catListId
      });

      // Update the category in the nestableMap
      var editCat = $scope.nestableMap[editCatDataId];
      editCat.name = $scope.editCatName;

      // Reset and close
      $scope.editCatName = '';
      editCatDataId = '';
      $scope.closeModal('#edit-category');
    };

    // Sets the board being edited
    $scope.setEditBoard = function(dataId) {
      var editBoard = $scope.nestableMap[dataId];
      editBoardDataId = dataId;
      editBoardId = editBoard.id;
      $scope.editBoardName = editBoard.name;
      $scope.editBoardDesc = editBoard.description;
    };

    var editedBoards = [];
    // Edits the set board
    $scope.editBoard = function() {
      var isExistingBoard = false;
      // Board being edited is a new board.
      if (!editBoardId && editBoardDataId) {
        $scope.newBoards.forEach(function(newBoard) {
          if (newBoard.dataId === editBoardDataId) {
            newBoard.name = $scope.editBoardName;
            newBoard.description = $scope.editBoardDesc;
          }
        });
      }
      // Board being edited is an existing board
      else {
        var editedBoard = {
          name: $scope.editBoardName,
          description: $scope.editBoardDesc
        };
        isExistingBoard = true;
        editedBoards.push(editedBoard);
      }

      $scope.$broadcast('editBoard', {
        boardName: $scope.editBoardName,
        dataId: editBoardDataId,
        isExistingBoard: isExistingBoard
      });

      // Update data stored in nestableMap to reflect edit
      var board = $scope.nestableMap[editBoardDataId];
      board.name = $scope.editBoardName;
      board.description = $scope.editBoardDesc;

      // Reset scope params for editing board
      editBoardDataId = '';
      editBoardId = '';
      $scope.editBoardName = '';
      $scope.editBoardDesc = '';
      console.log(JSON.stringify(editedBoards, null, 2));
      $scope.closeModal('#edit-board');
    };

  }
];
