var _ = require('lodash');

module.exports = ['$compile', function($compile) {
  return {
    restrict: 'E',
    require: '^categoryEditor',
    link: function(scope, element) {

      // Initialization
      scope.$watch('catListData', function(data) {
        if (!data) { data = []; }
        var html = generateCategoryList(data);
        // Compile html so angular controls will work
        var compiledHtml = $compile(html)(scope);
        $(element).html(compiledHtml);
        $('#' + scope.catListId).nestable(scope.catListOpts);
      }, true);

      // Generates nestable html for category data
      var generateCategoryList = function(categories) {
        var html = '<div class="dd" id="' + scope.catListId + '"><ol class="dd-list">';
        var sortedCats = _.sortBy(categories, function(cat) { return cat.view_order; });
        sortedCats.forEach(function(cat) {
          var dataId = scope.getDataId();
          var boardIds = [];
          var catBoards = cat.boards || [];
          catBoards.forEach(function(board) { boardIds.push(board.id); });
          scope.nestableMap[dataId] = {
            id: cat.id,
            name: cat.name,
            children_ids: boardIds
          };
          // Edit pencil and trash buttons
          var toolbarHtml = '<i data-reveal-id="delete-confirm" ng-click="setDelete(' + dataId + ')" class="dd-nodrag dd-right-icon fa fa-trash"></i>' +
            '<i data-reveal-id="edit-category" ng-click="setEditCat(' +
            dataId + ')" class="dd-nodrag dd-right-icon fa fa-pencil"></i>';
          var status = '<i class="fa status"></i>';
          html += '<li class="dd-item dd-root-item" data-cat-id="' + cat.id + '" data-id="' + dataId +
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
          var dataId = scope.getDataId();

          // Store boardData within each li's data-board attr for easy access
          scope.nestableMap[dataId] = {
            id: board.id,
            name: board.name,
            description: board.description,
            children_ids: board.children_ids || []
          };
          var toolbarHtml = '<i data-reveal-id="edit-board" ng-click="setEditBoard(' +
            dataId + ')" class="dd-nodrag dd-right-icon fa fa-pencil"></i>';
          var status = '<i class="fa status"></i>';
          html += '<li class="dd-item" data-id="' + dataId + '">' +
            '<div class="dd-handle">' + status + '<div class="dd-desc">' + board.name + '</div>' +
            toolbarHtml + '</div>' + generateBoardList(board.children) + '</li>';
        });
        html += '</ol>';
        return html;
      };

      scope.insertNewCategory = function() {
        var catName = scope.newCatName;
        if (catName) {
          var dataId = scope.getDataId();
          // Update hashmap of list items
          scope.nestableMap[dataId] = {
            name: catName,
            children_ids: []
          };

          // Edit pencil and trash buttons
          var toolbarHtml = '<i data-reveal-id="delete-confirm" ng-click="setDelete(' + dataId + ')" class="dd-nodrag dd-right-icon fa fa-trash"></i>' +
            '<i data-reveal-id="edit-category" ng-click="setEditCat(' +
              dataId + ')" class="dd-nodrag dd-right-icon fa fa-pencil"></i>';
          var status = '<i class="fa status modified"></i>';
          var newCatHtml = '<li class="dd-item dd-root-item" data-cat-id="' + -1 + '"  data-id="' + dataId +
            '" data-top="true" data-name="' + catName + '"><div class="dd-handle dd-root-handle">' +
            status + '<div class="dd-desc">' + catName + '</div>' + toolbarHtml + '</div></li>';

          // Compile and prepend new category html
          newCatHtml = $compile(newCatHtml)(scope);
          $('#' + scope.catListId + ' > .dd-list').prepend(newCatHtml);
          $('#' + scope.catListId).nestable(scope.catListOpts);
        }
        scope.newCatName = '';
      };
    }
  };
}];
