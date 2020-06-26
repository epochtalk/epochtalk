var sortBy = require('lodash/sortBy');

var directive = ['$compile', function($compile) {
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
        var sortedCats = sortBy(categories, 'view_order');
        sortedCats.forEach(function(cat) {
          var dataId = scope.getDataId();
          var boardIds = [];
          var catBoards = cat.boards || [];
          catBoards.forEach(function(board) { boardIds.push(board.id); });
          scope.nestableMap[dataId] = {
            id: cat.id,
            name: cat.name,
            viewable_by: cat.viewable_by,
            children: catBoards
          };
          // Edit pencil and trash buttons
          var toolbarHtml = '<i ng-click="setCatDelete(' + dataId + ')" class="dd-nodrag dd-right-icon fa fa-trash"></i>' +
            '<i ng-click="setEditCat(' +
            dataId + ')" class="dd-nodrag dd-right-icon fa fa-pencil"></i>';
          var status = '<i class="fa status"></i>';
          html += '<li class="dd-item dd-root-item" data-cat-id="' + cat.id + '" data-id="' + dataId +
            '" data-top="true" data-name="' + cat.name + '"><div class="dd-grab-cat"></div><div class="dd-handle' +
            ' dd-root-handle">' + status + '<div class="dd-desc">' + cat.name + '</div>' +
            toolbarHtml + '</div>' + generateBoardList(cat.boards) + '</li>';
        });
        html += '</ol></div>';
        return html;
      };

      // Generates nestable html elements for board data
      var generateBoardList = function(boards) {
        var html = '<ol class="dd-list">';
        boards.forEach(function(board) {
          var dataId = scope.getDataId();

          // Store boardData within each li's data-board attr for easy access
          scope.nestableMap[dataId] = {
            id: board.id,
            name: board.name,
            description: board.description,
            viewable_by: board.viewable_by,
            postable_by: board.postable_by,
            right_to_left: board.right_to_left,
            disable_signature: board.disable_signature,
            disable_selfmod: board.disable_selfmod,
            disable_post_edit: board.disable_post_edit,
            children: board.children || [],
            moderators: board.moderators || []
          };
          var toolbarHtml = '<i ng-click="setBoardDelete(' + dataId + ')" class="dd-nodrag dd-right-icon fa fa-trash"></i><i ng-click="setEditBoard(' +
            dataId + ')" class="dd-nodrag dd-right-icon fa fa-pencil"></i><i ng-click="setModBoard(' + dataId + ')" class="dd-nodrag dd-right-icon fa fa-user"></i>';
          var status = '<i class="fa status"></i>';
          html += '<li class="dd-item" data-board-id="' + board.id + '" data-id="' + dataId + '">' +
            '<div class="dd-grab"></div><div class="dd-handle">' + status + '<div class="dd-desc">' + board.name + '<span>' + board.description + '</span></div>' +
            toolbarHtml + '</div>' + generateBoardList(board.children || []) + '</li>';
        });
        html += '</ol>';
        return html;
      };

      scope.insertNewCategory = function() {
        var category = { name: scope.newCatName };

        if (category.name) {
          var dataId = scope.getDataId();
          // Update hashmap of list items
          scope.nestableMap[dataId] = { id: -1, name: category.name };
          category.dataId = dataId;
          scope.newCategories.push(category);

          // Edit pencil and trash buttons
          var toolbarHtml = '<i ng-click="setCatDelete(' + dataId + ')" class="dd-nodrag dd-right-icon fa fa-trash"></i>' +
            '<i ng-click="setEditCat(' +
              dataId + ')" class="dd-nodrag dd-right-icon fa fa-pencil"></i>';
          var status = '<i class="fa status modified"></i>';
          var newCatHtml = '<li class="dd-item dd-root-item" data-cat-id="' + -1 + '"  data-id="' + dataId + '" data-top="true" data-name="' + category.name +
            '"><div class="dd-grab-cat"></div><div class="dd-handle dd-root-handle">' +
            status + '<div class="dd-desc">' + category.name + '</div>' + toolbarHtml + '</div></li>';

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

module.exports = angular.module('ept.directives.nestable-categories', [])
.directive('nestableCategories', directive);
