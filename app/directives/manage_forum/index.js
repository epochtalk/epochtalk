var fs = require('fs');

module.exports = function() {
  return {
    restrict: 'E',
    template: fs.readFileSync(__dirname + '/../../templates/directives/manage-forum.html'),
    link: function(scope) {
      var index = 0;

      var generateCategoryList = function(categories) {
        var html = '<div class="dd" id="nestableCats"><ol class="dd-list">';
        categories.forEach(function(cat) {
          html += '<li class="dd-item" data-id="' + index++ + '" data-top="true" data-cat-name="' + cat.name + '"><div class="dd-handle dd-root-handle">' +
             cat.name + '</div>' + generateBoardList(cat.boards) + '</li>';
        });
        html += '</ol></div>';
        return html;
      };

      var generateBoardList = function(boards) {
        if (!boards) { return ''; }
        var html = '<ol class="dd-list">';
        boards.forEach(function(board) {
          html += '<li class="dd-item" data-id="' + index++ + '" data-board-id="' + board.id + '"><div class="dd-handle">' + board.name + '</div>' + generateBoardList(board.children) + '</li>';
        });
        html += '</ol>';
        return html;
      };

      var originalHtml;
      scope.$watch('categories', function(cats) {
        if (cats) {
          originalHtml = generateCategoryList(cats);
          $('#nestable-list').html(originalHtml);
          $('#nestableCats').nestable({ protectRoot: true, maxDepth: 10 });
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
              cat.board_ids.push(child.boardId);
            });
          }
          updatedCats.push(cat);
        });
        return updatedCats;
      };

      scope.expandAll = function() {
        $('#nestableCats').nestable('expandAll');
      };

      scope.collapseAll = function() {
        $('#nestableCats').nestable('collapseAll');
      };

      scope.submit = function() {
        var serializedArr = $('#nestableCats').nestable('serialize');
        var updatedCats = buildUpdatedCats(serializedArr);
        console.log(JSON.stringify(updatedCats, null, 2));
      };

      scope.reset = function() {
        $('#nestable-list').html(originalHtml);
        $('#nestableCats').nestable({ protectRoot: true, maxDepth: 10 });
      };
    }
  };
};