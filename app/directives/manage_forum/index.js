var fs = require('fs');
var _ = require('lodash');

module.exports = ['$http', '$route', '$q', function($http, $route, $q) {
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
      var newBoards = []; // stores newly added boards

      // Init for view (creates nestable lists for categorized/uncategorized boards)
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
          $('#nestable-cats').nestable({ protectRoot: true, maxDepth: 5, group: 1 });
          $('#nestable-boards').nestable({ protectRoot: true, maxDepth: 4, group: 1 });
        }
      }, true);

      // Generates nestable html for categories
      var generateCategoryList = function(categories) {
        var html = '<div class="dd" id="nestable-cats"><ol class="dd-list">';
        categories.forEach(function(cat) {
          var catData = JSON.stringify({
            name: cat.name,
            children_ids: cat.board_ids || []
          });
          var toolbarHtml = '<i ng-click="editCategory()" class="dd-nodrag dd-right-icon fa fa-pencil"></i>';
          html += '<li class="dd-item dd-root-item" data-id="' + nestIndex++ +
            '" data-top="true" data-cat=\'' + catData + '\'><div class="dd-handle' +
            ' dd-root-handle">' + cat.name + toolbarHtml +'</div>' + generateBoardList(cat.boards) + '</li>';
        });
        html += '</ol></div>';
        return html;
      };

      // Generates nestable html for boards
      var generateBoardList = function(boards) {
        if (!boards) { return ''; }
        var html = '<ol class="dd-list">';
        boards.forEach(function(board) {
          // Store boardData within each li's data-board attr for easy access
          var boardData = JSON.stringify({
            id: board.id,
            name: board.name,
            children_ids: board.children_ids || []
          });
          var toolbarHtml = '<i ng-click="editBoard()" class="dd-nodrag dd-right-icon fa fa-pencil"></i>';
          html += '<li class="dd-item" data-id="' + nestIndex++ + '" data-board=\'' + boardData + '\'><div class="dd-handle">' + board.name + toolbarHtml + '</div>' + generateBoardList(board.children) + '</li>';
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
        var html = '<div class="dd" id="nestable-boards">';
        html += noCatBoards.length > 0 ? generateBoardList(noCatBoards) : emptyHtml;
        html += '</div>';
        return html;
      };

      // Translates serialized array into boards.updateCategory format
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

      // Recursively builds a hashmap of moved boards
      var buildMovedBoardsHash = function(boardsArr, movedBoards) {
        if (!boardsArr) { return; }
        movedBoards = movedBoards || {};
        boardsArr.forEach(function(item) {
          var newChildrenIds = [];
          var board = item.board || item.cat;
          item.children = item.children || [];
          item.children.forEach(function(childItem) {
            var childBoard = childItem.board;
            newChildrenIds.push(childBoard.id);
          });
          // If arrays are not equal, a change has occured
          if(!_.isEqual(board.children_ids, newChildrenIds)) {
            var removedChildren = _.difference(board.children_ids, newChildrenIds);
            var addedChildren = _.difference(newChildrenIds, board.children_ids);
            removedChildren.forEach(function(removedChild) {
              movedBoards[removedChild] = movedBoards[removedChild] || {};
              movedBoards[removedChild].oldParent = board.id || '';
              if (movedBoards[removedChild].oldParent === '' && movedBoards[removedChild].newParent === '') {
                delete movedBoards[removedChild];
              }
            });
            addedChildren.forEach(function(addedChild) {
              movedBoards[addedChild] = movedBoards[addedChild] || {};
              movedBoards[addedChild].newParent = board.id || '';
              if (movedBoards[addedChild].oldParent === '' && movedBoards[addedChild].newParent === '') {
                delete movedBoards[addedChild];
              }
            });
            // Ordering change for non top level boards (Update Board children_ids order)
            if (!removedChildren.length && !addedChildren.length && board.id) {
              console.log('Reordering: ' + JSON.stringify(board));
              $http({
                url: '/api/boards/' + board.id,
                method: 'POST',
                data: {
                  children_ids: newChildrenIds
                }
              })
              .success(function(board) {
                console.log('Reordered To: ' + JSON.stringify(board));
              });
            }
          }
          buildMovedBoardsHash(item.children, movedBoards);
        });
        for (var key in movedBoards) { // Remove boards without an old parent
          if (!movedBoards[key].oldParent && movedBoards[key].newParent === '') {
            delete movedBoards[key];
          }
        }
        return movedBoards;
      };

      // 1) Create Boards which have been added
      var createNewBoards = function() {
        return $q(function(resolve, reject) {
          if (!newBoards.length) { resolve(); }
          console.log('1) Adding new Boards: \n' + JSON.stringify(newBoards, null, 2));
          var remaining = newBoards.length;
          newBoards.forEach(function(newBoard) {
            $http({
              url: '/api/boards',
              method: 'POST',
              data: {
                name: newBoard.name
              }
            })
            .success(function(board) {
              console.log('Created New Board: ' + JSON.stringify(board));
              var newBoardEl = $('li[data-id="' + newBoard.dataId + '"]');
              var newBoardData = newBoardEl.data().board;
              newBoardData.id = board.id;
              newBoardEl.data().board = newBoardData;
              remaining--;
              if (remaining === 0) {
                resolve();
              }
            })
            .error(function(data) {
              reject(data);
            });
          });
        });
      };

      // 2) Handle Boards which have been moved/reordered
      var processMoveBoards = function(movedBoards) {
        return $q(function(resolve, reject) {
          console.log('2) Handling moved boards');
          console.log(JSON.stringify(movedBoards, null, 2));
          resolve();
        });
      };

      // 3) Updated all Categories
      var updateCategories = function(updatedCats) {
        return $q(function(resolve, reject) {
          console.log('3) Updating Categories: \n' + JSON.stringify(updatedCats, null, 2));
          $http({
            url: '/api/boards/categories',
            method: 'POST',
            data: {
              categories: updatedCats
            }
          })
          .success(function() {
            resolve();
          })
          .error(function(data) {
            reject(data);
          });
        });
      };

      scope.submit = function() {
        // 1) Create Boards which have been added
        var serializedCats;
        return createNewBoards()
        .then(function() {
          serializedCats = $('#nestable-cats').nestable('serialize');
          var serializedBoards = $('#nestable-boards').nestable('serialize');
          var movedBoards = buildMovedBoardsHash(serializedCats);
          movedBoards = buildMovedBoardsHash(serializedBoards, movedBoards);
          // 2) Handle Boards which have been moved/reordered
          return processMoveBoards(movedBoards);
        })
        .then(function() {
          // 3) Updated all Categories
          var updatedCats = buildUpdatedCats(serializedCats);
          return updateCategories(updatedCats);
        })
        .then(function() {
          console.log('Done Saving!');
          $route.reload();
        });
      };

      // Resets to original state
      scope.reset = function() {
        $('#cat-list').html(originalCatHtml);
        $('#no-cat-boards-list').html(originalNoCatHtml);
        $('#nestable-cats').nestable({ protectRoot: true, maxDepth: 5, group: 1 });
        $('#nestable-boards').nestable({ protectRoot: true, maxDepth: 4, group: 1 });
      };

      // Expands all Categories/Boards
      scope.expandAll = function() {
        $('#nestable-cats').nestable('expandAll');
      };

      // Collapses all Categories/Boards
      scope.collapseAll = function() {
        $('#nestable-cats').nestable('collapseAll');
      };

      // Creates a new category
      scope.insertNewCategory = function() {
        if (scope.newCatName !== '') {
          var catData = JSON.stringify({
            name: scope.newCatName,
            children_ids: []
          });
          var toolbarHtml = '<i ng-click="editCategory()" class="dd-nodrag dd-right-icon fa fa-pencil"></i>';
          var newCatHtml = '<li class="dd-item dd-root-item" data-id="' + nestIndex++ +
            '" data-top="true" data-cat=\'' + catData + '\'>' +
            '<div class="dd-handle dd-root-handle">' +  scope.newCatName + toolbarHtml + '</div></li>';
          $('#nestable-cats > .dd-list').prepend(newCatHtml);
          $('#nestable-cats').nestable({ protectRoot: true, maxDepth: 5, group: 1 });
          scope.newCatName = '';
        }
      };

      // Creates a new board
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
            children_ids: []
          };
          newBoards.push(newBoard);
          var newBoardData = JSON.stringify(newBoard);
          var toolbarHtml = '<i ng-click="editCategory()" class="dd-nodrag dd-right-icon fa fa-pencil"></i>';
          var newBoardHtml = '<li class="dd-item" data-id="' + nestIndex++ +
            '" data-board=\'' + newBoardData + '\'><div class="dd-handle dd-added-handle">' +  scope.newBoardName + toolbarHtml + '</div></li>';
          $('#nestable-boards > .dd-list').prepend(newBoardHtml);
          $('#nestable-boards').nestable({ protectRoot: true, maxDepth: 4, group: 1 });
          scope.newBoardName = '';
        }
      };
    }
  };
}];