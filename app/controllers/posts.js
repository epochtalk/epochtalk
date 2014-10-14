module.exports = ['$scope', '$timeout', '$location', '$anchorScroll', '$routeParams', '$rootScope', 'Auth', 'Threads', 'Posts', 'breadcrumbs',
  function($scope, $timeout, $location, $anchorScroll, $routeParams, $rootScope, Auth, Threads, Posts, breadcrumbs) {
    $scope.loggedIn = Auth.isAuthenticated;
    var threadId = $routeParams.threadId;
    // TODO: this needs to be grabbed from user settings
    $scope.page = Number($routeParams.page) || 1;
    $scope.pageCount = 1;
    $scope.posts = null;
    $scope.newPost = { title: '' };
    $scope.tempPosts = {};
    var postCount;
    var limit;
    var postsPerPage;
    // Loading post calls

    Threads.get({ id: threadId }).$promise
    .then(function(thread) {
      $scope.newPost.title = 'Re: ' + thread.title;
      $scope.newPost.thread_id = thread.id;

      breadcrumbs.options = { 'Thread Page': thread.title };
      $rootScope.breadcrumbs = breadcrumbs.get();

      postCount = thread.post_count;
      limit = $routeParams.limit;
      postsPerPage = limit === 'all' ? Number(postCount) : Number(limit) || 10;

      $scope.pageCount = Math.ceil(postCount / postsPerPage);
      return postsPerPage;
    })
    .then(function(postsPerPage) {
      var query = {
        thread_id: threadId,
        limit: postsPerPage,
        page: $scope.page
      };
      return Posts.byThread(query).$promise;
    })
    .then(function(threadPosts) {
      $scope.posts = threadPosts;

      if ($location.hash().length > 0) {
        gotoAnchor($location.hash());
      }
    });

    var gotoAnchor = function(id, jumpToLastPage) {
      $timeout(function() {
        if (jumpToLastPage) {
          $location.search('page', $scope.pageCount);
        }
        $location.hash(id);
        $anchorScroll();
      });
    };

    // new post methods

    $scope.saveText = function(encoded, text) {
      $scope.newPost.encodedBody = encoded;
      $scope.newPost.body = text;
    };

    $scope.savePost = function() {
      delete $scope.newPost.error;

      // error check input
      if (!$scope.newPost.title || $scope.newPost.title.length === 0) {
        $scope.newPost.error = {};
        $scope.newPost.error.message = 'No Title Found';
        return;
      }
      if (!$scope.newPost.body || $scope.newPost.body.length === 0) {
        $scope.newPost.error = {};
        $scope.newPost.error.message = 'No Post Body Found';
        return;
      }

      $scope.newPost.body = $scope.newPost.encodedBody;
      Posts.save($scope.newPost).$promise
      .then(function(data) {
        postCount++; // Increment post count and recalculate pageCount
        postsPerPage = limit === 'all' ? Number(postCount) : Number(limit) || 10;
        $scope.pageCount = Math.ceil(postCount / postsPerPage);
        gotoAnchor(data.id, true);
      })
      .catch(function(response) {
        console.log(response);
        var error = '';
        if (response.status === 500) {
          error = 'Post could not be saved. ';
          error += 'Please refresh the page.';
        }
        else { error = response.data.message; }

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
      if (editPost.encodedBody) {
        $scope.tempPosts[editPost.id].encodedBody = editPost.encodedBody;
      }
      else {
        $scope.tempPosts[editPost.id].encodedBody = editPost.body;
      }
      $scope.posts[index].editMode = true;
    };

    $scope.saveEditText = function(post, encoded, text) {
      post.encodedBody = encoded;
      post.body = text;
    };

    $scope.saveEditPost = function(index) {
      var editPost = $scope.posts[index];

      // check input
      delete editPost.error;
      if (!editPost.title || editPost.title.length === 0) {
        $scope.posts[index].error = {};
        $scope.posts[index].error.message = 'No Title Found';
        return;
      }
      if (!editPost.body || editPost.body.length === 0) {
        $scope.posts[index].error = {};
        $scope.posts[index].error.message = 'No Post Body Found';
        return;
      }

      var saveEditPost = {
        title: editPost.title,
        body: editPost.encodedBody,
        thread_id: editPost.thread_id
      };


      Posts.update({id: editPost.id}, saveEditPost).$promise
      .then(function(data) { gotoAnchor(data.id); })
      .catch(function(response) {
        var error = '';
        if (response.status === 500) {
          error = 'Post was not able to be saved. ';
          error += 'Please refresh the page.';
        }
        else { error = response.data.message; }

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
