var _ = require('lodash');

module.exports = ['$scope', '$routeParams', '$http', '$rootScope', 'breadcrumbs',
  function($scope, $routeParams, $http, $rootScope, breadcrumbs) {
    var rowsPerPage = 10;
    var threadId = $routeParams.threadId;
    $scope.posts = null;
    $scope.pageKeys = [];
    $http({ // Temporary in order to get total postCount
      url: '/api/posts',
      method: 'GET',
      params: {
        thread_id: threadId,
        limit: 99999
      }
    })
    .success(function(posts) {
      breadcrumbs.options = { 'Thread': posts[0].title };
      $rootScope.breadcrumbs = breadcrumbs.get();

      var postCount = posts.length;
      var totalPages = Math.ceil(postCount / rowsPerPage);
      var pageCount = 0;
      var keyIndex = 0;
      for (var i = 0; i < totalPages; i++) {
        var id = i === 0 ? null : posts[keyIndex-1].id;
        keyIndex += rowsPerPage;
        var key = { page: pageCount++, id: id };
        $scope.pageKeys.push(key);
      }
      $http({
        url: '/api/posts',
        method: 'GET',
        params: {
          thread_id: threadId,
          limit: rowsPerPage
        }
      })
      .success(function(threadPosts) {
        $scope.posts = threadPosts;
        $scope.page = _.findIndex($scope.pageKeys, threadPosts[0].id) + 1;
      });
    });

    $scope.gotoPage = function(pageKey) {
      $http({
        url: '/api/posts',
        method: 'GET',
        params: {
          thread_id: threadId,
          post_id: pageKey.id,
          limit: rowsPerPage
        }
      })
      .success(function(posts) {
        $scope.page = pageKey.page;
        $scope.posts = posts;
      });
    };

    $scope.paginateNext = function() {
      if($scope.pageKeys.length > 0 && $scope.page < $scope.pageKeys.length - 1) {
        $http({
          url: '/api/posts',
          method: 'GET',
          params: {
            thread_id: threadId,
            post_id: $scope.pageKeys[$scope.page + 1].id,
            limit: rowsPerPage
          }
        })
        .success(function(posts) {
          $scope.page = $scope.pageKeys[$scope.page + 1].page;
          $scope.posts = posts;
        });
      }
    };

    $scope.paginatePrev = function() {
      if ($scope.page > 0) {
        $http({
          url: '/api/posts',
          method: 'GET',
          params: {
            thread_id: threadId,
            post_id: $scope.pageKeys[$scope.page - 1].id,
            limit: rowsPerPage
          }
        })
        .success(function(posts) {
          $scope.page = $scope.pageKeys[$scope.page - 1].page;
          $scope.posts = posts;
        });
      }
    };

  }
];
