var fs = require('fs');
var _ = require('lodash');

module.exports = ['$state', function($state) {
  return {
    restrict: 'E',
    template: fs.readFileSync(__dirname + '/category-editor.html'),
    controller: function($scope) {
      $scope.catListId = 'categorized-boards';
      $scope.boardListId = 'uncategorized-boards';
      $scope.catListOpts = { protectRoot: true, maxDepth: 5, group: 1 };
      $scope.boardListOpts = { protectRoot: true, maxDepth: 4, group: 1 };
      var dataId = 0;

      var deleteDataId = ''; // Stores the data-id of item being deleted

      var editCatDataId = ''; // Stores the data-id of category being edited
      $scope.editCatName = ''; // Model for edited category name

      var editBoardDataId = ''; // Stores the data-id of board being edited
      var editBoardId = ''; // Stores the id of the board being edited
      $scope.editBoardName = ''; // Model for edited board name
      $scope.editBoardDesc = ''; // Model for edited board desc

      $scope.getDataId = function() {
        return dataId++;
      };

      $scope.setEditCat = function(dataId) {
        var editCat = $scope.nestableMap[dataId];
        editCatDataId = dataId;
        $scope.editCatName = editCat.name;
      };

      // Edits the set category
      $scope.editCategory = function() {
        var editCatEl = $('li[data-id="' + editCatDataId + '"]');
        // Update UI to reflect change
        var catDescEl = editCatEl.children('.dd-handle').children('.dd-desc');
        catDescEl.text($scope.editCatName);
        // Show that the item was changed
        var status = editCatEl.children('.dd-handle').children('.status');
        status.addClass('modified');

        // Update the category name
        var editCatData = editCatEl.data();
        editCatData.name = $scope.editCatName;
        var editCat = $scope.nestableMap[editCatDataId];
        editCat.name = $scope.editCatName;

        // Reset and close
        $scope.editCatName = '';
        editCatDataId = '';
        $scope.closeModal('#edit-category');
      };

      $scope.setEditBoard = function(dataId) {
        var editBoard = $scope.nestableMap[dataId];
        editBoardDataId = dataId;
        editBoardId = editBoard.id;
        $scope.editBoardName = editBoard.name;
        $scope.editBoardDesc = editBoard.description;
      };

      // Edits the set board
      $scope.editBoard = function() {
        // Board being edited is a new board.
        if (editBoardId === -1 && editBoardDataId) {
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
         $scope.editedBoards[editBoardId] = editedBoard;
        }

        var editBoardEl = $('li[data-id="' + editBoardDataId + '"]');
        var status = editBoardEl.children('.dd-handle').children('.status');
        status.addClass('modified');

        // Update UI to reflect change
        var boardDescEl = editBoardEl.children('.dd-handle').children('.dd-desc');
        boardDescEl.text($scope.editBoardName);

        // Update data stored in nestableMap to reflect edit
        var board = $scope.nestableMap[editBoardDataId];
        board.name = $scope.editBoardName;
        board.description = $scope.editBoardDesc;

        // Reset scope params for editing board
        editBoardDataId = '';
        editBoardId = '';
        $scope.editBoardName = '';
        $scope.editBoardDesc = '';
        $scope.closeModal('#edit-board');
      };

      $scope.setDelete = function(dataId) {
        deleteDataId = dataId;
      };

      $scope.confirmDelete = function() {
        var deleteEl = $('li[data-id="' + deleteDataId + '"]');
        if (deleteEl) {
          var boardListEl = $('#' + $scope.boardListId + ' > .dd-list');
          var childBoardsHtml = deleteEl.children('.dd-list').html();
          boardListEl.append(childBoardsHtml);
          deleteEl.remove();
        }

        deleteDataId = '';
        $scope.closeModal('#delete-confirm');
      };

      $scope.closeModal = function(modalId) {
        $(modalId).foundation('reveal', 'close');
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
        $state.go($state.$current, null, { reload: true });
      };

      $scope.save = function() {
        var serializedCats = $('#' + $scope.catListId).nestable('serialize');
        var serializedBoards = $('#' + $scope.boardListId).nestable('serialize');
        return $scope.processNewBoards() // 1) Create new boards
        .then(function() {
          buildMovedBoardsHash(serializedCats);
          buildMovedBoardsHash(serializedBoards);
          // 2) Handle Boards which have been moved/reordered
          return $scope.processMoveBoards();
        })
        .then(function() {
          // 3) Handle Boards which have been edited
          return $scope.processEditedBoards();
        })
        .then(function() {
          // 4) Updated all Categories
          buildUpdatedCats(serializedCats);
          return $scope.processCategories();
        })
        .then(function() {
          console.log('Done Saving!');
          return $state.go($state.$current, null, { reload: true });
        });
      };

      // Translates serialized array into boards.updateCategory format
      var buildUpdatedCats = function(catsArr) {
        var updatedCats = $scope.updatedCats;
        catsArr.forEach(function(item) {
          var cat = {
            id: item.catId,
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
      };

      // Recursively builds a hashmap of moved boards
      var buildMovedBoardsHash = function(boardsArr) {
        var movedBoards = $scope.movedBoards;
        if (!boardsArr) { return; }
        boardsArr.forEach(function(item) {
          var newChildrenIds = [];
          var board = $scope.nestableMap[item.id]; // original board object
          item.children = item.children || [];
          if (!item.catId) { // Dont process category changes
            // Lookup each childItem by its data-id in the nestableMap
            item.children.forEach(function(childItem) {
              var childBoard = $scope.nestableMap[childItem.id];
              newChildrenIds.push(childBoard.id); // populate array of latest children ids
            });

            // If arrays are not equal, a change has occured
            if(!_.isEqual(board.children_ids, newChildrenIds)) {
              var removedChildren = _.difference(board.children_ids, newChildrenIds);
              var addedChildren = _.difference(newChildrenIds, board.children_ids);
              // Set Old Parent of moved board
              removedChildren.forEach(function(removedChild) {
                movedBoards[removedChild] = movedBoards[removedChild] || {};
                movedBoards[removedChild].oldParent = board.id || '';
                if (movedBoards[removedChild].oldParent === '' && movedBoards[removedChild].newParent === '') {
                  delete movedBoards[removedChild]; // Ignore top level board changes
                }
              });

              // Set New Parent of moved board
              addedChildren.forEach(function(addedChild) {
                movedBoards[addedChild] = movedBoards[addedChild] || {};
                movedBoards[addedChild].newParent = board.id || '';
                if (movedBoards[addedChild].oldParent === '' && movedBoards[addedChild].newParent === '') {
                  delete movedBoards[addedChild]; // Ignore top level board changes
                }
              });

              // Ordering change for non top level boards (Update Board children_ids order)
              // Top level ordering is handled by updateCategories, parent boards children_ids
              // array must be updated to fix ordering of child boards.
              if (!removedChildren.length && !addedChildren.length && board.id) {
                $scope.editedBoards[board.id] = $scope.editedBoards[board.id] || {};
                $scope.editedBoards[board.id].children_ids =  newChildrenIds;
              }
            }
          }
          buildMovedBoardsHash(item.children);
        });

        // Remove boards without an old parent/new parent
        for (var key in movedBoards) {
          // Newly added boards
          if (!movedBoards[key].oldParent && movedBoards[key].newParent === '') {
            delete movedBoards[key];
          }
          // Board moved from root to root location
          else if (!movedBoards[key].newParent && movedBoards[key].oldParent === '') {
            delete movedBoards[key];
          }
        }
      };

    }
  };
}];
