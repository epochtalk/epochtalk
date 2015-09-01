module.exports = [
  '$rootScope', '$scope', '$timeout', '$anchorScroll', '$location', 'Session', 'Threads', 'Posts', 'pageData',
  function($rootScope, $scope, $timeout, $anchorScroll, $location, Session, Threads, Posts, pageData) {
    var ctrl = this;
    var parent = $scope.$parent.PostsParentCtrl;
    parent.page = Number(pageData.page);
    parent.limit = Number(pageData.limit);
    parent.posts = pageData.posts;
    parent.thread = pageData.thread;
    parent.board_id = pageData.thread.board_id;
    this.rootUrl = generateBaseUrl();
    this.user = Session.user;
    this.posts = pageData.posts;
    this.thread = pageData.thread;
    this.loadEditor = parent.loadEditor;
    this.addQuote = parent.addQuote;
    this.openReportModal = parent.openReportModal;
    $timeout($anchorScroll);

    // init function
    (function() {
      parent.pageCount = Math.ceil(parent.thread.post_count / parent.limit);
      parent.getBoards();
      $timeout(function() { highlight($location.hash()); }, 500);
    })();

    // default post avatar image if not found
    ctrl.posts.map(function(post) {
      if (!post.avatar) {
        post.avatar = 'https://fakeimg.pl/400x400/ccc/444/?text=' + post.user.username;
      }
    });

    this.offLCS = $rootScope.$on('$locationChangeSuccess', function(event){
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

      if (pageChanged || limitChanged) { parent.pullPage(); }
    });
    $scope.$on('$destroy', function() { ctrl.offLCS(); });

    parent.pullPage = function() {
      var query = {
        thread_id: parent.thread.id,
        page: parent.page,
        limit: parent.limit
      };

      // replace current posts with new posts
      Posts.byThread(query).$promise
      .then(function(pageData) {
        // default post avatar image if not found
        pageData.posts.map(function(post) {
          if (!post.avatar) {
            post.avatar = 'https://fakeimg.pl/400x400/ccc/444/?text=' + post.user.username;
          }
        });
        ctrl.posts = pageData.posts;
        parent.posts = pageData.posts;
        parent.thread.post_count = pageData.thread.post_count;
        parent.pageCount = Math.ceil(parent.thread.post_count / parent.limit);
        $timeout($anchorScroll);
      });
    };

    this.highlightPost = function() {
      $timeout(function() { highlight($location.hash()); });
    };

    function highlight(postId) {
      ctrl.posts.map(function(post) {
        if (post.id === postId) { post.highlighted = true; }
        else { post.highlighted = false; }
      });
    }

    function generateBaseUrl() {
      var url = $location.protocol() + '://';
      url += $location.host();
      if ($location.port() !== 80) { url += ':' + $location.port(); }
      url += $location.path();
      return url;
    }
  }
];
