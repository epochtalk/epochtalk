var fs = require('fs');

module.exports = ['$state', function($state) {
  return {
    restrict: 'E',
    template: fs.readFileSync(__dirname + '/category-editor.html'),
    controller: function($scope) {
      var dataId = 0;
      $scope.catListId = 'categorized-boards';
      $scope.boardListId = 'uncategorized-boards';
      $scope.catListOpts = { protectRoot: true, maxDepth: 5, group: 1 };
      $scope.boardListOpts = { protectRoot: true, maxDepth: 4, group: 1 };

      var deleteCatDataId = '';
      var editCatDataId = ''; // Stores the data-id of category being edited
      $scope.editCatName = ''; // Model for edited category name

      var deleteBoardDataId = '';
      var editBoardDataId = ''; // Stores the data-id of board being edited
      var editBoardId = ''; // Stores the id of the board being edited
      $scope.editBoardName = ''; // Model for edited board name
      $scope.editBoardDesc = ''; // Model for edited board desc

      $scope.getDataId = function() { return dataId++; };

      /* Edit Category */

      $scope.setEditCat = function(dataId) {
        var editCat = $scope.nestableMap[dataId];
        editCatDataId = dataId;
        $scope.editCatName = editCat.name;
      };

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

      /* Edit Board */

      $scope.setEditBoard = function(dataId) {
        var editBoard = $scope.nestableMap[dataId];
        editBoardDataId = dataId;
        editBoardId = editBoard.id;
        $scope.editBoardName = editBoard.name;
        $scope.editBoardDesc = editBoard.description;
      };

      $scope.editBoard = function() {
        // Board being edited is in new board array
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
            id: editBoardId,
            name: $scope.editBoardName,
            description: $scope.editBoardDesc
          };
         $scope.editedBoards.push(editedBoard);
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

      /* Delete Category */

      $scope.closeModal = function(modalId) { $(modalId).foundation('reveal', 'close'); };

      $scope.setCatDelete = function(dataId) { deleteCatDataId = dataId; };

      $scope.confirmCatDelete = function() {
        // find category to delete
        var deleteEl = $('li[data-id="' + deleteCatDataId + '"]');
        if (deleteEl) {
          // attach children boards to board listing
          var boardListEl = $('#' + $scope.boardListId + ' > .dd-list');
          var childBoardsHtml = deleteEl.children('.dd-list').html();
          boardListEl.append(childBoardsHtml);
          deleteEl.remove();
        }
        // add this cat to the deletedCategories list
        var category = $scope.nestableMap[deleteCatDataId];
        $scope.deletedCategories.push(category.id);

        // reset form and modal
        deleteCatDataId = '';
        $scope.closeModal('#delete-category');
      };

      /* Delete Board */

      $scope.setBoardDelete = function(dataId) { deleteBoardDataId = dataId; };

      $scope.confirmBoardDelete = function() {
        // find category to delete
        var deleteEl = $('li[data-id="' + deleteBoardDataId + '"]');
        if (deleteEl) {
          // attach children boards to board listing
          var boardListEl = $('#' + $scope.boardListId + ' > .dd-list');
          var childBoardsHtml = deleteEl.children('.dd-list').html();
          boardListEl.append(childBoardsHtml);
          deleteEl.remove();
        }
        // add this cat to the deletedCategories list
        var board = $scope.nestableMap[deleteBoardDataId];
        $scope.deletedBoards.push(board.id);

        // reset form and modal
        deleteBoardDataId = '';
        $scope.closeModal('#delete-board');
      };

      /* Expand/Collapse all Categories/Boards */
      $scope.expandAll = function() { $('#' + $scope.catListId).nestable('expandAll'); };
      $scope.collapseAll = function() { $('#' + $scope.catListId).nestable('collapseAll'); };

      /* Save/Reset Page */
      $scope.reset = function() { $state.go($state.$current, null, { reload: true }); };

      $scope.save = function() {
        var serializedCats = $('#' + $scope.catListId).nestable('serialize');
        // 0) Create new Categories
        return $scope.processNewCategories()
        // 1) Create new boards
        .then($scope.processNewBoards)
        // 2) Handle Boards which have been edited
        .then($scope.processEditedBoards)
        // 3) Handle Boards which have been deleted
        .then($scope.processDeletedBoards)
        // 4) Handle Categories which have been deleted
        // .thne($scope.processDeletedCategories)
        // 3) Updated all Categories
        .then(function() {
          var mapping = buildUpdatedCats(serializedCats);
          return $scope.processCategories(mapping);
        })
        .then(function() {
          console.log('Done Saving!');
          return $state.go($state.$current, { saved: true }, { reload: true });
        });
      };

      /* Translates serialized array into boards.updateCategory format */
      function buildUpdatedCats(catsArr) {
        var boardMapping = [];
        catsArr.forEach(function(cat, index) {
          // add this cat as a row entry
          var catId = $scope.nestableMap[cat.id].id;
          var row = { type: 'category', id: catId, name: cat.name, view_order: index };
          boardMapping.push(row);

          // add children boards as entries recursively
          if (!cat.children) { return; }
          cat.children.forEach(function(catBoard, index) {
            // add this cat board as a row entry
            var boardId = $scope.nestableMap[catBoard.id].id;
            var boardRow = {
              type: 'board',
              id: boardId,
              category_id: catId,
              view_order: index
            };
            boardMapping.push(boardRow);

            // add any children board entries
            if (catBoard.children && catBoard.children.length > 0) {
              buildEntries(catBoard.children, boardId, boardMapping);
            }
          });
        });
        return boardMapping;
      }

      function buildEntries(currentBoards, parentId, boardMapping) {
        currentBoards.forEach(function(board, index) {
          // add this board as a row entry
          var boardId = $scope.nestableMap[board.id].id;
          var row = { type: 'board', id: boardId, parent_id: parentId, view_order: index };
          boardMapping.push(row);

          // add any children boards as a row entry
          if (board.children && board.children.length > 0) {
            buildEntries(board.children, boardId, boardMapping);
          }
        });
      }
    }
  };
}];
