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

      var generateCategoryList = function(categories) {
        var html = '<div class="dd" id="nestable-cats"><ol class="dd-list">';
        categories.forEach(function(cat) {
          html += '<li class="dd-item dd-root-item" data-id="' + nestIndex++ + '" data-top="true" data-cat-name="' + cat.name + '"><div class="dd-handle dd-root-handle">' +
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
        catsArr.forEach(function(category) {
          var cat = {
            name: category.catName,
            board_ids: []
          };
          if (category.children) {
            category.children.forEach(function(child) {
              cat.board_ids.push(child.board.id);
            });
          }
          updatedCats.push(cat);
        });
        return updatedCats;
      };

      var processBoardChanges = function(boardsArr) {
        if (!boardsArr) { return; }
        var newChildren = [];
        boardsArr.forEach(function(item) {
          var board = item.board;
          if (item.children) {
            item.children.forEach(function(childItem) {
              var childBoard = childItem.board;
              newChildren.push(childBoard.id);
            });
            if(!_.isEqual(board.children_ids, newChildren)) {
              console.log('old children:');
              console.log(board.children_ids);
              console.log('new children:');
              console.log(newChildren);
            }
            processBoardChanges(item.children);
          }
        });
      };

      scope.insertNewCategory = function() {
        if (scope.newCatName !== '') {
          var newCatHtml = '<li class="dd-item dd-root-item" data-id="' + nestIndex++ +
            '" data-top="true" data-cat-name="' + scope.newCatName + '">' +
            '<div class="dd-handle dd-root-handle">' +  scope.newCatName + '</div></li>';
          $('#nestable-cats > .dd-list').prepend(newCatHtml);
          $('#nestable-cats').nestable({ protectRoot: true, maxDepth: 4, group: 1 });
          scope.newCatName = '';
        }
      };

      scope.insertNewBoard = function() {
        if (scope.newBoardName !== '') {
          var newBoardHtml = '<li class="dd-item" data-id="' + nestIndex++ +
            '" data-board="' + { name: scope.newBoardName }+ '"><div class="dd-handle">' +  scope.newBoardName + '</div></li>';
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
        var serializedArr = $('#nestable-cats').nestable('serialize');

        console.log(JSON.stringify(serializedArr, null, 2));
        serializedArr.forEach(function(cat) {
          processBoardChanges(cat.children);
        });
        var updatedCats = buildUpdatedCats(serializedArr);
        console.log(JSON.stringify(updatedCats, null, 2));
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