module.exports = ['$compile', function($compile) {
  return {
    restrict: 'E',
    scope: {
      data: '=',
      nestableMap: '=',
      newBoards: '=',
      setEditCat: '&',
      setEditBoard: '&',
      setDelete: '&'
    },
    link: function(scope, element) {
      var dataId = 0; // used to populate unique data-id attribute
      var nestableId; // id of the nestable list
      var opts; // Stores options for nestable list

      // ========================
      // Nestable List Generation
      // ========================

      // Initialization
      scope.$watch('data', function(data) {

        if (data && data.length) {
          var html;
          var firstItem = data[0];
          if (firstItem.board_ids) { // categories were passed into 'data'
            nestableId = 'categorized-boards';
            opts = { protectRoot: true, maxDepth: 5, group: 1 };
            html = generateCategoryList(data);
          }
          else if (firstItem.id) { // boards were passed in
            nestableId = 'uncategorized-boards';
            opts = { protectRoot: true, maxDepth: 4, group: 1 };
            html = generateNoCatBoardsList(data);
          }
          // Compile html so angular controls will work
          var compiledHtml = $compile(html)(scope);
          $(element).html(compiledHtml);
          $('#' + nestableId).nestable(opts);
        }
      }, true);

      // Generates nestable html for category data
      var generateCategoryList = function(categories) {
        var html = '<div class="dd" id="' + nestableId + '"><ol class="dd-list">';
        categories.forEach(function(cat) {
          scope.nestableMap[nestableId + '-' + dataId] = {
            name: cat.name,
            children_ids: cat.board_ids || []
          };
          // Edit pencil and trash buttons
          var toolbarHtml = '<i data-reveal-id="delete-confirm" ng-click="setDeleteDataId(\'' +
             nestableId + '-' + dataId + '\')" class="dd-nodrag dd-right-icon fa fa-trash"></i>' +
            '<i data-reveal-id="edit-category" ng-click="setEditCatDataId(\'' + nestableId + '-' +
            dataId + '\')" class="dd-nodrag dd-right-icon fa fa-pencil"></i>';
          var status = '<i class="fa status"></i>';
          html += '<li class="dd-item dd-root-item" data-id="' + nestableId + '-' + dataId++ +
            '" data-top="true" data-name="' + cat.name + '"><div class="dd-handle' +
            ' dd-root-handle">' + status + '<div class="dd-desc">' + cat.name + '</div>' +
            toolbarHtml + '</div>' + generateBoardList(cat.boards) + '</li>';
        });
        html += '</ol></div>';
        return html;
      };

      // Generates nestable html elements for board data
      var generateBoardList = function(boards) {
        if (!boards) { return ''; }
        var html = '<ol class="dd-list">';
        boards.forEach(function(board) {
          // Store boardData within each li's data-board attr for easy access
          scope.nestableMap[nestableId + '-' + dataId] = {
            id: board.id,
            name: board.name,
            description: board.description,
            children_ids: board.children_ids || []
          };
          var toolbarHtml = '<i data-reveal-id="delete-confirm" ng-click="setDeleteDataId(\'' +
            nestableId + '-' + dataId + '\')" class="dd-nodrag dd-right-icon fa fa-trash"></i>' +
            '<i data-reveal-id="edit-board" ng-click="setEditBoardDataId(\'' + nestableId + '-' +
            dataId + '\')" class="dd-nodrag dd-right-icon fa fa-pencil"></i>';
          var status = '<i class="fa status"></i>';
          html += '<li class="dd-item" data-id="' + nestableId + '-' + dataId++ + '">' +
            '<div class="dd-handle">' + status + '<div class="dd-desc">' + board.name + '</div>' +
            toolbarHtml + '</div>' + generateBoardList(board.children) + '</li>';
        });
        html += '</ol>';
        return html;
      };

      // Generates nestable html for uncategorized boards
      var generateNoCatBoardsList = function(boards) {
        var noCatBoards = [];
        boards.forEach(function(board) {
          if (!board.category_id && board.category_id !== 0) {
            noCatBoards.push(board);
          }
        });
        var emptyHtml = '<div class="dd-empty"></div>';
        var html = '<div class="dd" id="' + nestableId + '">';
        html += noCatBoards.length > 0 ? generateBoardList(noCatBoards) : emptyHtml;
        html += '</div>';
        return html;
      };

      // ==================================
      // Communicate with Parent Controller
      // ==================================

      // Tells the parent controller the dataId of the category being edited
      scope.setEditCatDataId = function(dataId) {
        // call parent controller
        scope.setEditCat({data: dataId});
      };

      // Tells the parent controller the dataId of the board being edited
      scope.setEditBoardDataId = function(dataId) {
        // call parent controller
        scope.setEditBoard({data: dataId});
      };

      // Tells the parent controller the dataId of the item being deleted
      scope.setDeleteDataId = function(dataId) {
        // call parent controller
        scope.setDelete({data: dataId});
      };

      // ===============
      // UI Manipulation
      // ===============

      // Listen for parent controller adding categories
      scope.$on('insertNewCategory', function(scopeDetails, data) {
        if (data.listId === nestableId) {
          insertNewCategory(data.newCatName);
        }
      });

      // Creates a new category
      var insertNewCategory = function(catName) {
        if (catName !== '') {
          // Update hashmap of list items
          scope.nestableMap[nestableId + '-' + dataId] = {
            name: catName,
            children_ids: []
          };

          // Edit pencil and trash buttons
          var toolbarHtml = '<i data-reveal-id="delete-confirm" ng-click="setDeleteDataId(\'' +
            nestableId + '-' + dataId + '\')" class="dd-nodrag dd-right-icon fa fa-trash"></i>' +
            '<i data-reveal-id="edit-category" ng-click="setEditCatDataId(\'' + nestableId + '-' +
              dataId + '\')" class="dd-nodrag dd-right-icon fa fa-pencil"></i>';
          var status = '<i class="fa status"></i>';
          var newCatHtml = '<li class="dd-item dd-root-item" data-id="' + nestableId + '-' + dataId++ +
            '" data-top="true" data-name="' + catName + '"><div class="dd-handle dd-root-handle">' +
            status + '<div class="dd-desc">' + catName + '</div>' + toolbarHtml + '</div></li>';

          // Compile and prepend new category html
          newCatHtml = $compile(newCatHtml)(scope);
          $('#' + nestableId + ' > .dd-list').prepend(newCatHtml);
          $('#' + nestableId).nestable(opts);
        }
      };

      // Listen for parent controller adding boards
      scope.$on('insertNewBoard', function(scopeDetails, data) {
        if (data.listId === nestableId) {
          insertNewBoard(data.newBoard);
        }
      });

      // Creates a new board
      var insertNewBoard = function(board) {
        if (board.name !== '') {
          // Update hashmap of list items
          scope.nestableMap[nestableId + '-' + dataId] = {
            id: '',
            name: board.name,
            description: board.description,
            children_ids: [],
          };
          // Add dataId to board before adding to new boards array
          // to allow for quick lookup in nestableMap from parent controller
          board.dataId = nestableId + '-' + dataId;
          scope.newBoards.push(board);

          //Add list if list is currently empty
          if ($('#' + nestableId).children('.dd-empty').length) {
            $('#' + nestableId).html('<ol class="dd-list"></ol>');
          }
          var toolbarHtml = '<i data-reveal-id="delete-confirm" ng-click="setDeleteDataId(\'' +
            nestableId + '-' + dataId + '\')" class="dd-nodrag dd-right-icon fa fa-trash"></i>' +
            '<i data-reveal-id="edit-board" ng-click="setEditBoardDataId(\'' + nestableId + '-' +
            dataId + '\')" class="dd-nodrag dd-right-icon fa fa-pencil"></i>';
          var status = '<i class="fa status added"></i>';
          var newBoardHtml = '<li class="dd-item" data-id="' + nestableId + '-' + dataId++ +
            '"><div class="dd-handle">' + status + '<div class="dd-desc">' + board.name +
            '</div>' + toolbarHtml + '</div></li>';

          // Compile and prepend new board html
          newBoardHtml = $compile(newBoardHtml)(scope);
          $('#' + nestableId + '> .dd-list').prepend(newBoardHtml);
          $('#' + nestableId).nestable(opts);
        }
      };

      // Listen for parent controller deleting list items
      scope.$on('confirmDelete', function(scopeDetails, data) {
        confirmDelete(data.dataId);
      });

      // Updates UI when item is deleted from nestable list
      var confirmDelete = function(dataId) {
        var deleteEl = $('li[data-id="' + dataId + '"]');
        if (deleteEl) { deleteEl.remove(); }
      };

      // Listen for parent controller editing categories
      scope.$on('editCategory', function(scopeDetails, data) {
        if (data.listId === nestableId) {
          editCategory(data.newCatName, data.dataId);
        }
      });

      // Updates UI when Category is edited
      var editCategory = function(newCatName, dataId) {
        var editCatEl = $('li[data-id="' + dataId + '"]');
        // Update UI to reflect change
        var catDescEl = editCatEl.children('.dd-handle').children('.dd-desc');
        catDescEl.text(newCatName);
        // Show that the item was changed
        var status = editCatEl.children('.dd-handle').children('.status');
        status.addClass('edited');
      };

      // Listen for parent controller editing boards
      scope.$on('editBoard', function(scopeDetails, data) {
        editBoard(data.boardName, data.dataId, data.isExistingBoard);
      });

      // Updates UI when Board is edited
      var editBoard = function(boardName, dataId, isExistingBoard) {
        var editBoardEl = $('li[data-id="' + dataId + '"]');
        if (isExistingBoard) {
          // editedBoards[scope.editBoardId] = editedBoard;
          var status = editBoardEl.children('.dd-handle').children('.status');
          status.addClass('edited');
        }
        // Update UI to reflect change
        var boardDescEl = editBoardEl.children('.dd-handle').children('.dd-desc');
        boardDescEl.text(boardName);
      };

    }
  };
}];