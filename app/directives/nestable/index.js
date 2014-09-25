module.exports = function() {
  return {
    restrict: 'E',
    link: function(scope, element, attrs) {
      var index = 0;

      var generateCategoryList = function(categories) {
        var html = '<div class="dd" id="nestableCats"><ol class="dd-list">';
        categories.forEach(function(cat) {
          html += '<li class="dd-item" data-id="' + index++ + '" data-top="true"><div class="dd-handle dd-root-handle">' +
             cat.name + '</div>' + generateBoardList(cat.boards) + '</li>';
        });
        html += '</ol></div>';
        return html;
      };

      var generateBoardList = function(boards) {
        if (!boards) { return ''; }
        var html = '<ol class="dd-list">';
        boards.forEach(function(board) {
          html += '<li class="dd-item" data-id="' + index++ + '"><div class="dd-handle">' + board.name + '</div>' + generateBoardList(board.children) + '</li>';
        });
        html += '</ol>';
        return html;
      };

      scope.$watch('categories', function(cats) {
        if (cats) {
          $(element).html(generateCategoryList(cats));
          $('#nestableCats').nestable({ protectRoot: true, maxDepth: 10 });
        }
      }, true);
    }
  };
};