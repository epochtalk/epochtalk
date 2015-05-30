module.exports = [
  '$rootScope', '$scope', '$timeout', '$anchorScroll', '$location', 'Session', 'Threads', 'Posts', 'thread', 'posts', 'page', 'limit',
  function($rootScope, $scope, $timeout, $anchorScroll, $location, Session, Threads, Posts, thread, posts, page, limit) {
    var ctrl = this;
    var parent = $scope.$parent.PostsParentCtrl;
    parent.page = page;
    parent.limit = limit;
    parent.thread_id = thread.id;
    parent.thread_title = thread.title;
    parent.thread_post_count = thread.post_count;
    parent.thread_locked = thread.locked;
    parent.thread_sticky = thread.sticky;
    parent.thread_user = thread.user;
    parent.posts = posts;
    this.rootUrl = generateBaseUrl();

    this.user = Session.user;
    this.posts = posts;
    this.thread = thread;
    $timeout($anchorScroll);

    this.offLCS = $rootScope.$on('$locationChangeSuccess', function(event){
      var params = $location.search();
      var page = Number(params.page) || 1;
      var limit = params.limit === 'all' ? params.limit : (Number(params.limit) || 10);
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

      if (pageChanged || limitChanged) { parent.pullPage(); }
    });
    $scope.$on('$destroy', function() { ctrl.offLCS(); });

    // default post avatar image if not found
    ctrl.posts.map(function(post) {
      if (!post.avatar) {
        post.avatar = 'http://placehold.it/400/cccccc/&text=Avatar';
      }
    });

    this.loadEditor = parent.loadEditor;
    this.addQuote = parent.addQuote;
    this.openReportModal = parent.openReportModal;
    parent.pullPage = function() {
      var query = {
        thread_id: parent.thread_id,
        page: parent.page,
        limit: parent.limit
      };

      // update thread's post page count
      Threads.get({ id: ctrl.thread.id }).$promise
      .then(function(thread) { parent.thread_post_count = thread.post_count; });

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

    function generateBaseUrl() {
      var url = $location.protocol() + '://';
      url += $location.host();
      if ($location.port() !== 80) { url += ':' + $location.port(); }
      url += $location.path();
      return url;
    }
  }
];
