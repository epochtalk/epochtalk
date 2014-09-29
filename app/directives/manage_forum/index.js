var fs = require('fs');

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
      var originalCatBoards;
      var originalUncatBoards;

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
          html += '<li class="dd-item" data-id="' + nestIndex++ + '" data-board="' + board + '"><div class="dd-handle">' + board.name + '</div>' + generateBoardList(board.children) + '</li>';
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

          originalCatBoards = $('#nestable-cats').nestable('serialize');
          originalUncatBoards = $('#nestable-boards').nestable('serialize');
        }
      }, true);

      var buildUpdatedCats = function(serializedArr) {
        var updatedCats = [];
        serializedArr.forEach(function(category) {
          var cat = {
            name: category.catName,
            board_ids: []
          };
          if (category.children) {
            category.children.forEach(function(child) {
              cat.board_ids.push(child.board.boardId);
            });
          }
          updatedCats.push(cat);
        });
        return updatedCats;
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
        console.log(JSON.stringify(originalCatBoards, null, 2));

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