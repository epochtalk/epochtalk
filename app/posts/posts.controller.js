module.exports = [
  '$scope', '$timeout', '$anchorScroll', '$uiViewScroll', 'Posts', 'thread', 'posts', 'page', 'limit',
  function($scope, $timeout, $anchorScroll, $uiViewScroll, Posts, thread, posts, page, limit) {
    var ctrl = this;
    var parent = $scope.$parent.PostsParentCtrl;
    parent.page = page;
    parent.limit = limit;
    
    thread.$promise.then(function(threadPromise) {
      parent.thread_id = threadPromise.id;
      parent.thread_title = threadPromise.title;
      parent.thread_post_count = threadPromise.post_count;
    });

    posts.$promise.then(function(posts) {
      ctrl.posts = posts;
      parent.posts = posts;
      $timeout($anchorScroll);
    });

    this.writePost = parent.writePost;
    parent.pullPage = function(page, anchor) {
      var query = {
        thread_id: parent.thread_id,
        page: page,
        limit: parent.limit
      };
      if (parent.limit === 'all') { query.limit = parent.thread_post_count; }

      // replace current posts with new posts
      Posts.byThread(query).$promise
      .then(function(posts) {
        ctrl.posts = posts;
        parent.posts = posts;
        // set hash and scroll
        $timeout(function() {
          var element = document.getElementById(anchor);
          element = angular.element(element);
          $uiViewScroll(element);
        });
      });
    };
  }
];
