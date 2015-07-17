module.exports = ['$compile', function($compile) {
  return {
    restrict: 'E',
    require: '^categoryEditor',
    link: function(scope, element) {

      // Initialization
      scope.$watch('boardListData', function(data) {
        if (!data) { data = []; }
        var html = generateNoCatBoardsList(data);
        // Compile html so angular controls will work
        var compiledHtml = $compile(html)(scope);
        $(element).html(compiledHtml);
        $('#' + scope.boardListId).nestable(scope.boardListOpts);
      }, true);

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
            children: board.children || []
          };
          var toolbarHtml = '<i data-reveal-id="delete-board" ng-click="setBoardDelete(' + dataId + ')" class="dd-nodrag dd-right-icon fa fa-trash"></i><i data-reveal-id="edit-board" ng-click="setEditBoard(' +
            dataId + ')" class="dd-nodrag dd-right-icon fa fa-pencil"></i>';
          var status = '<i class="fa status"></i>';
          html += '<li class="dd-item" data-board-id="' + board.id + '" data-id="' + dataId + '"><div class="dd-grab"></div>' +
            '<div class="dd-handle">' + status + '<div class="dd-desc">' + board.name +  '<span>' + board.description + '</span></div>' +
            toolbarHtml + '</div>' + generateBoardList(board.children || []) + '</li>';
        });
        html += '</ol>';
        return html;
      };

      // Generates nestable html for uncategorized boards
      var generateNoCatBoardsList = function(boards) {
        var emptyHtml = '<div class="dd-empty"></div>';
        var html = '<div class="dd" id="' + scope.boardListId + '">';
        html += boards.length > 0 ? generateBoardList(boards) : emptyHtml;
        html += '</div>';
        return html;
      };

      scope.insertNewBoard = function() {
        var board = {
          name: scope.newBoardName || '',
          description: scope.newBoardDesc || ''
        };

        if (board.name !== '') {
          var dataId = scope.getDataId();
          // Update hashmap of list items
          scope.nestableMap[dataId] = {
            id: -1,
            name: board.name,
            description: board.description,
            children: board.children || []
          };
          // Add dataId to board before adding to new boards array
          // to allow for quick lookup in nestableMap from parent controller
          board.dataId = dataId;
          scope.newBoards.push(board);

          //Add list if list is currently empty
          if ($('#' + scope.boardListId).children('.dd-empty').length) {
            $('#' + scope.boardListId).html('<ol class="dd-list"></ol>');
          }
          var toolbarHtml = '<i data-reveal-id="delete-board" ng-click="setBoardDelete(' + dataId + ')" class="dd-nodrag dd-right-icon fa fa-trash"></i><i data-reveal-id="edit-board" ng-click="setEditBoard(' +
            dataId + ')" class="dd-nodrag dd-right-icon fa fa-pencil"></i>';
          var status = '<i class="fa status modified"></i>';
          var newBoardHtml = '<li class="dd-item" data-id="' + dataId +
            '"><div class="dd-grab"></div><div class="dd-handle">' + status + '<div class="dd-desc">' + board.name +
             '<span>' + board.description + '</span></div>' + toolbarHtml + '</div></li>';

          // Compile and prepend new board html
          newBoardHtml = $compile(newBoardHtml)(scope);
          $('#' + scope.boardListId + '> .dd-list').prepend(newBoardHtml);
          $('#' + scope.boardListId).nestable(scope.boardListOpts);
        }

        scope.closeModal('#add-new-board');
        scope.newBoardName = '';
        scope.newBoardDesc = '';
      };

    }
  };
}];
