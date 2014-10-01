module.exports = ['$scope', '$route', '$routeParams', '$http', '$rootScope', 'breadcrumbs', 'Auth',
  function($scope, $route, $routeParams, $http, $rootScope, breadcrumbs, Auth) {
    $scope.loggedIn = Auth.isAuthenticated;
    var threadId = $routeParams.threadId;
    // TODO: this needs to be grabbed from user settings
    $scope.page = Number($routeParams.page) || 1;
    $scope.pageCount = 1;
    $scope.posts = null;
    $scope.newPost = { title: '' };
    $scope.tempPosts = {};

    // Loading post calls

    $http({
      url: '/api/thread/',
      method: 'GET',
      params: { id: threadId }
    })
    .success(function(thread) {
      $scope.newPost.title = 'Re: ' + thread.title;
      $scope.newPost.thread_id = thread.id;

      breadcrumbs.options = { 'Thread': thread.title };
      $rootScope.breadcrumbs = breadcrumbs.get();
      
      var postCount = thread.post_count;
      var postsPerPage = Number($routeParams.limit) || 10;
      $scope.pageCount = Math.ceil(postCount / postsPerPage);
      $http({
        url: '/api/posts',
        method: 'GET',
        params: {
          thread_id: threadId,
          limit: postsPerPage,
          page: $scope.page
        }
      })
      .success(function(threadPosts) { $scope.posts = threadPosts; });
    });

    // new post methods

    $scope.saveText = function(encoded, text) {
      $scope.newPost.encodedBody = encoded;
      $scope.newPost.body = text;
    };

    $scope.savePost = function(post) {
      $http.post('/api/posts', $scope.newPost)
      .success(function(data) { $route.reload(); })
      .error(function(data, status) {
        var error = '';
        if (status === 500) {
          error = 'Post could not be saved. ';
          error += 'Please refresh the page.';
        }
        else { error = data.message; }

        $scope.newPost.error = {};
        $scope.newPost.error.message = error;
      });
    };

    // edit post methods

    $scope.startEditPost = function(index) {
      var editPost = $scope.posts[index];
      $scope.tempPosts[editPost.id] = {};
      $scope.tempPosts[editPost.id].title = editPost.title;
      $scope.tempPosts[editPost.id].body = editPost.body;
      $scope.tempPosts[editPost.id].encodedBody = editPost.encodedBody;
      $scope.posts[index].editMode = true;
    };

    $scope.saveEditText = function(post, encoded, text) {
      post.encodedBody = encoded;
      post.body = text;
    };

    $scope.saveEditPost = function(index) {
      var editPost = $scope.posts[index];
      var saveEditPost = {
        title: editPost.title,
        body: editPost.body,
        encodedBody: editPost.encodedBody,
        thread_id: editPost.thread_id
      };

      $http.post('/api/posts/' + editPost.id, saveEditPost)
      .success(function(data) { $route.reload(); })
      .error(function(data, status) {
        var error = '';
        if (status === 500) {
          error = 'Post was not able to be saved. ';
          error += 'Please refresh the page.';
        }
        else { error = data.message; }

        $scope.posts[index].error = {};
        $scope.posts[index].error.message = error;
      });
    };

    $scope.cancelEditPost = function(index) {
      var cancelPost = $scope.posts[index];
      $scope.posts[index].title = $scope.tempPosts[cancelPost.id].title;
      $scope.posts[index].body = $scope.tempPosts[cancelPost.id].body;
      $scope.posts[index].encodedBody = $scope.tempPosts[cancelPost.id].encodedBody;
      $scope.posts[index].editMode = false;
    };
  }
];
