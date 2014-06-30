var _ = require('lodash');

module.exports = ['$scope', '$routeParams', '$http',
  function($scope, $routeParams, $http) {
    var rowsPerPage = 10;
    var parentPostId = $routeParams.parentPostId;
    $scope.posts = [];
    $http.get('/api/threads/' + parentPostId + '/posts')
    .success(function(posts) {
      posts.rows.forEach(function(post) {
        $scope.posts.push(post);
      });
      $http.get('/api/threads/' + parentPostId)
      .success(function(threadData) {
        // Save paged_post_keys to scope (for paging)
        $scope.pageKeys = threadData.paged_post_keys;
        // Build the current pages key from the first post in the $scope.post array
        var parentPostId = $scope.posts[0].parent_post_id ? $scope.posts[0].parent_post_id : $scope.posts[0]._id;
        var curKey = [parentPostId, $scope.posts[0].timestamps.created];
        // Determine the page the client is on
        $scope.page = _.findIndex($scope.pageKeys, curKey);
      });
    });

    $scope.gotoPage = function(pageKey, page) {
      $http({
        url: '/api/threads/' + parentPostId + '/posts',
        method: 'GET',
        params: {
          startkey: pageKey,
        }
      })
      .success(function(posts) {
        $scope.page = page;
        $scope.posts = posts.rows;
      });
    };

    $scope.paginateNext = function() {
      if($scope.pageKeys.length > 1 && $scope.page < $scope.pageKeys.length - 1) {
        $http({
          url: '/api/threads/' + parentPostId + '/posts',
          method: 'GET',
          params: {
            startkey: $scope.pageKeys[$scope.page + 1],
          }
        })
        .success(function(posts) {
          $scope.page++;
          $scope.posts = posts.rows;
        });
      }
    };

    $scope.paginatePrevAPI = function() {
      $http.get('/api/threads/' + parentPostId + '/posts?endkey_docid=' + $scope.posts.rows[0].id)
      .success(function(posts) {
        $scope.page = (posts.offset / rowsPerPage) + 1;
        $scope.posts = posts;
      });
    };
    
    $scope.paginatePrev = function() {
      if ($scope.page > 0) {
        $http({
          url: '/api/threads/' + parentPostId + '/posts',
          method: 'GET',
          params: {
            startkey: $scope.pageKeys[$scope.page - 1],
          }
        })
        .success(function(posts) {
          $scope.page--;
          $scope.posts = posts.rows;
        });
      }
    };
  }
];
