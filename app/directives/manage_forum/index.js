var fs = require('fs');
var _ = require('lodash');

module.exports = function() {
  return {
    restrict: 'E',
    template: fs.readFileSync(__dirname + '/../../templates/directives/manage-forum.html'),
    scope: {
      categories: '=',
      boards: '=',
    },
    link: function(scope) {
      scope.newCatName = '';
      scope.newBoardName = '';
      var nestIndex = 0;
      var newBoards = [];
      var deletedBoards = [];

      var generateCategoryList = function(categories) {
        var html = '<div class="dd" id="nestable-cats"><ol class="dd-list">';
        categories.forEach(function(cat) {
          var catData = JSON.stringify({
            name: cat.name,
            children_ids: cat.board_ids || []
          });
          html += '<li class="dd-item dd-root-item" data-id="' + nestIndex++ + '" data-top="true" data-cat=\'' + catData + '\'><div class="dd-handle dd-root-handle">' +
             cat.name + '</div>' + generateBoardList(cat.boards) + '</li>';
        });
        html += '</ol></div>';
        return html;
      };

      var generateBoardList = function(boards) {
        if (!boards) { return ''; }
        var html = '<ol class="dd-list">';
        boards.forEach(function(board) {
          var boardData = JSON.stringify({
            id: board.id,
            name: board.name,
            parent_id: board.parent_id || '',
            children_ids: board.children_ids || []
          });
          html += '<li class="dd-item" data-id="' + nestIndex++ + '" data-board=\'' + boardData + '\'><div class="dd-handle">' + board.name + '</div>' + generateBoardList(board.children) + '</li>';
        });
        html += '</ol>';
        return html;
      };

      var generateNoCatBoardsList = function(boards) {
        var noCatBoards = [];
        boards.forEach(function(board) {
          if (!board.category_id && board.category_id !== 0) {
            noCatBoards.push(board);
          }
        });
        var emptyHtml = '<div class="dd-empty"></div>';
        var html = '<div class="dd" id="nestable-boards">';
        html += noCatBoards.length > 0 ? generateBoardList(noCatBoards) : emptyHtml;
        html += '</div>';
        return html;
      };

      var originalCatHtml;
      var originalNoCatHtml;
      scope.$watchGroup(['categories', 'boards'], function(newValues) {
        var cats = newValues[0];
        var boards = newValues[1];
        if (cats && boards) {
          originalCatHtml = generateCategoryList(cats);
          originalNoCatHtml = generateNoCatBoardsList(boards);
          $('#cat-list').html(originalCatHtml);
          $('#no-cat-boards-list').html(originalNoCatHtml);
          $('#nestable-cats').nestable({ protectRoot: true, maxDepth: 4, group: 1 });
          $('#nestable-boards').nestable({ protectRoot: true, maxDepth: 3, group: 1 });
        }
      }, true);

      var buildUpdatedCats = function(catsArr) {
        var updatedCats = [];
        catsArr.forEach(function(item) {
          var cat = {
            name: item.cat.name,
            board_ids: []
          };
          if (item.children) {
            item.children.forEach(function(child) {
              cat.board_ids.push(child.board.id);
            });
          }
          updatedCats.push(cat);
        });
        return updatedCats;
      };

      var processChanges = function(boardsArr) {
        if (!boardsArr) { return; }
        boardsArr.forEach(function(item) {
          var newChildrenIds = [];
          var board = item.board || item.cat;
          item.children = item.children || [];
          item.children.forEach(function(childItem) {
            var childBoard = childItem.board;
            newChildrenIds.push(childBoard.id);
          });
          if(!_.isEqual(board.children_ids, newChildrenIds)) {
            console.log('Cat/Board Name: ' + board.name);
            console.log('Board ID: ' + board.id);
            console.log('Parent ID: ' + board.parent_id);
            console.log('old children:');
            console.log(board.children_ids);
            console.log('new children:');
            console.log(newChildrenIds);
          }
          processChanges(item.children);
        });
      };

      scope.insertNewCategory = function() {
        if (scope.newCatName !== '') {
          var catData = JSON.stringify({
            name: scope.newCatMame,
            children_ids: []
          });
          var newCatHtml = '<li class="dd-item dd-root-item" data-id="' + nestIndex++ +
            '" data-top="true" data-cat=\'' + catData + '\'>' +
            '<div class="dd-handle dd-root-handle">' +  scope.newCatName + '</div></li>';
          $('#nestable-cats > .dd-list').prepend(newCatHtml);
          $('#nestable-cats').nestable({ protectRoot: true, maxDepth: 4, group: 1 });
          scope.newCatName = '';
        }
      };

      scope.insertNewBoard = function() {
        if (scope.newBoardName !== '') {
          // Add list if list is currently empty
          if ($('#nestable-boards').children('.dd-empty').length) {
            $('#nestable-boards').html('<ol class="dd-list"></ol>');
          }
          var newBoard = {
            id: '',
            dataId: nestIndex,
            name: scope.newBoardName,
            parent_id: '',
            children_ids: []
          };
          newBoards.push(newBoard);
          var newBoardData = JSON.stringify(newBoard);
          var newBoardHtml = '<li class="dd-item" data-id="' + nestIndex++ +
            '" data-board=\'' + newBoardData + '\'><div class="dd-handle">' +  scope.newBoardName + '</div></li>';
          $('#nestable-boards > .dd-list').prepend(newBoardHtml);
          $('#nestable-boards').nestable({ protectRoot: true, maxDepth: 3, group: 1 });
          scope.newBoardName = '';
        }
      };

      scope.expandAll = function() {
        $('#nestable-cats').nestable('expandAll');
      };

      scope.collapseAll = function() {
        $('#nestable-cats').nestable('collapseAll');
      };

      scope.submit = function() {

        var i = 0;
        // 1) Create new Boards
        console.log('Adding new Boards: \n' + JSON.stringify(newBoards, null, 2));
        newBoards.forEach(function(newBoard) {
           var newBoardEl = $('li[data-id="' + newBoard.dataId + '"]');
           var newBoardData = newBoardEl.data().board;
           newBoardData.id = 'OH SNAP' + i++;
           newBoardEl.data().board = newBoardData;
        });

        // 2) Delete removed Boards
        console.log('Deleting removed boards:');
        deletedBoards.forEach(function(deleteBoard) {
          console.log(deleteBoard);
          // core.boards.delete
        });

        // 3) Handle Board Ordering/Move Changes
        console.log('Handling moved boards');
        var serializedArr = $('#nestable-cats').nestable('serialize');
        processChanges(serializedArr);

        // 4) Updated all Categories
        var updatedCats = buildUpdatedCats(serializedArr);
        console.log('Updating Categories: \n' + JSON.stringify(updatedCats, null, 2));

        // Order of Operations
        // 1) Add all new Boards (boards.create)
        // 2) Handle boards that were deleted (boards.update?)
        // 3) Handle boards moved to other boards (boards.moveChildBoard)
        // 4) Update categories (boards.updateCategories)
      };

      scope.reset = function() {
        $('#cat-list').html(originalCatHtml);
        $('#no-cat-boards-list').html(originalNoCatHtml);
        $('#nestable-cats').nestable({ protectRoot: true, maxDepth: 4, group: 1 });
        $('#nestable-boards').nestable({ protectRoot: true, maxDepth: 3, group: 1 });
      };
    }
  };
};