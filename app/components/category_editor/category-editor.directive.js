var remove = require('lodash/array/remove');

module.exports = ['$state', function($state) {
  return {
    restrict: 'E',
    template: require('./category-editor.html'),
    controller: ['$scope', function($scope) {
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

      $scope.getDataId = function() { return dataId++; };

      /* Modals */
      $scope.showAddBoard = false;
      $scope.showEditBoard = false;
      $scope.showDeleteBoard = false;
      $scope.showEditCategory = false;
      $scope.showDeleteCategory = false;

      /* Add Boards */
      $scope.clearAddBoardFields = function() {
        $('#newBoardName').val('');
        $('#newBoardDesc').val('');
        $('#newBoardViewable').val('');
      };

      /* Edit Category */
      $scope.setEditCat = function(dataId) {
        var editCat = $scope.nestableMap[dataId];
        editCatDataId = dataId;
        $('#editCatName').val(editCat.name);
        $('#editCatViewable').val(editCat.viewable_by);
        $scope.showEditCategory = true;
      };

      $scope.editCategory = function() {
        var editCatEl = $('li[data-id="' + editCatDataId + '"]');
        // Update UI to reflect change
        var catDescEl = editCatEl.children('.dd-handle').children('.dd-desc');
        catDescEl.text($('#editCatName').val());
        // Show that the item was changed
        var status = editCatEl.children('.dd-handle').children('.status');
        status.addClass('modified');

        // Update the category name
        var editCatData = editCatEl.data();
        editCatData.name = $('#editCatName').val();
        var editCat = $scope.nestableMap[editCatDataId];
        editCat.name = $('#editCatName').val();
        editCat.viewable_by = $('#editCatViewable').val();

        // Reset and close
        editCatDataId = '';
        $('#editCatName').val('');
        $('#editCatViewable').val('');
        $scope.showEditCategory = false;
      };

      $scope.setModBoard = function(dataId) {
        $scope.openModeratorsModal($scope.nestableMap[dataId]);
      };

      /* Edit Board */
      $scope.setEditBoard = function(dataId) {
        var editBoard = $scope.nestableMap[dataId];
        editBoardDataId = dataId;
        editBoardId = editBoard.id;
        $('#editBoardName').val(editBoard.name);
        $('#editBoardDesc').val(editBoard.description);
        $('#editBoardViewable').val(editBoard.viewable_by);
        $scope.showEditBoard = true;
      };

      $scope.editBoard = function() {
        // Board being edited is in new board array
        if (editBoardId === -1 && editBoardDataId) {
          $scope.newBoards.forEach(function(newBoard) {
            if (newBoard.dataId === editBoardDataId) {
              newBoard.name = $('#editBoardName').val();
              newBoard.description = $('#editBoardDesc').val();
              newBoard.viewable_by = $('#editBoardViewable').val();
            }
          });
        }
        // Board being edited is an existing board
        else {
          var editedBoard = {
            id: editBoardId,
            name: $('#editBoardName').val(),
            description: $('#editBoardDesc').val(),
            viewable_by: $('#editBoardViewable').val() || null
          };
         $scope.editedBoards.push(editedBoard);
        }

        var editBoardEl = $('li[data-id="' + editBoardDataId + '"]');
        var status = editBoardEl.children('.dd-handle').children('.status');
        status.addClass('modified');

        // Update UI to reflect change
        var boardDescEl = editBoardEl.children('.dd-handle').children('.dd-desc');
        boardDescEl.html($('#editBoardName').val() + '<span>' +  $('#editBoardDesc').val() + '</span>');

        // Update data stored in nestableMap to reflect edit
        var board = $scope.nestableMap[editBoardDataId];
        board.name = $('#editBoardName').val();
        board.description = $('#editBoardDesc').val();
        board.viewable_by = $('#editBoardViewable').val();

        // Reset scope params for editing board
        editBoardDataId = '';
        editBoardId = '';
        $('#editBoardName').val('');
        $('#editBoardDesc').val('');
        $('#editBoardViewable').val('');
        $scope.showEditBoard = false;
      };

      /* Delete Category */
      $scope.setCatDelete = function(dataId) {
        deleteCatDataId = dataId;
        $scope.showDeleteCategory = true;
      };

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
        if (category.id === -1) {
          remove($scope.newCategories, function(cat) {
            return cat.dataId === deleteCatDataId;
          });
        }
        else { $scope.deletedCategories.push(category.id); }

        // reset form and modal
        deleteCatDataId = '';
        $scope.showDeleteCategory = false;
      };

      /* Delete Board */
      $scope.setBoardDelete = function(dataId) {
        deleteBoardDataId = dataId;
        $scope.showDeleteBoard = true;
      };

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

        // add this board to the deletedBoards list
        var board = $scope.nestableMap[deleteBoardDataId];
        if (board.id === -1) {
          remove($scope.newBoards, function(b) {
            return b.dataId === deleteBoardDataId;
          });
        }
        else { $scope.deletedBoards.push(board.id); }

        // reset form and modal
        deleteBoardDataId = '';
        $scope.showDeleteBoard = false;
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
        .then($scope.processDeletedCategories)
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
          var catViewableBy = $scope.nestableMap[cat.id].viewable_by;
          var row = { type: 'category', id: catId, name: cat.name, viewable_by: catViewableBy, view_order: index };
          boardMapping.push(row);

          // add children boards as entries recursively
          if (!cat.children) { return; }
          cat.children.forEach(function(catBoard, index) {
            // add this cat board as a row entry
            var boardId = $scope.nestableMap[catBoard.id].id;
            var boardViewableBy = $scope.nestableMap[catBoard.id].viewable_by;
            var boardRow = {
              type: 'board',
              id: boardId,
              category_id: catId,
              viewable_by: boardViewableBy,
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
    }]
  };
}];
