module.exports = [
  '$rootScope', '$scope', '$timeout', '$anchorScroll', '$location', 'Posts', 'thread', 'posts', 'page', 'limit',
  function($rootScope, $scope, $timeout, $anchorScroll, $location, Posts, thread, posts, page, limit) {
    var ctrl = this;
    var parent = $scope.$parent.PostsParentCtrl;
    parent.page = page;
    parent.limit = limit;

    parent.thread_id = thread.id;
    parent.thread_title = thread.title;
    parent.thread_post_count = thread.post_count;

    ctrl.posts = posts;
    parent.posts = posts;
    $timeout($anchorScroll);

    $rootScope.$on('$locationChangeSuccess', function(event){
      var params = $location.search();
      var page = Number(params.page);
      var limit = Number(params.limit);
      var pageChanged = false;
      var limitChanged = false;

      if (page && page !== parent.page) {
        pageChanged = true;
        parent.page = page;
      }
      if (limit && limit !== parent.limit) {
        limitChanged = true;
        parent.limit = limit;
      }

      if(pageChanged || limitChanged) {
        parent.pullPage(parent.page, undefined);
      }
    });

    // default post avatar image if not found
    ctrl.posts.map(function(post) {
      if (!post.avatar) {
        post.avatar = 'http://placehold.it/400/cccccc/&text=Avatar';
      }
    });

    this.loadEditor = parent.loadEditor;
    this.addQuote = parent.addQuote;
    parent.pullPage = function(page) {
      var query = {
        thread_id: parent.thread_id,
        page: page,
        limit: parent.limit
      };
      if (parent.limit === 'all') { query.limit = parent.thread_post_count; }

      // replace current posts with new posts
      Posts.byThread(query).$promise
      .then(function(posts) {
        // default post avatar image if not found
        posts.map(function(post) {
          if (!post.avatar) {
            post.avatar = 'http://placehold.it/400/cccccc/&text=Avatar';
          }
        });
        ctrl.posts = posts;
        parent.posts = posts;
        $timeout($anchorScroll);
      });
    };
  }
];
