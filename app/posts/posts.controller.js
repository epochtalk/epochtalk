var ctrl = [
  '$rootScope', '$scope', '$timeout', '$anchorScroll', '$location', 'Alert', 'Watchlist', 'Session', 'Threads', 'Posts', 'pageData',
  function($rootScope, $scope, $timeout, $anchorScroll, $location, Alert, Watchlist, Session, Threads, Posts, pageData) {
    var ctrl = this;
    var parent = $scope.$parent.PostsParentCtrl;
    parent.loggedIn = Session.isAuthenticated;
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
    $timeout($anchorScroll, 100);

    // Get access rights to page controls for authed user
    this.controlAccess = Session.getControlAccess('postControls', pageData.thread.board_id);

    // init function
    (function() {
      calculatePollPercentage();
      parent.pageCount = Math.ceil(parent.thread.post_count / parent.limit);
      $timeout(function() { highlight($location.hash()); }, 500);
    })();

    // default post avatar image if not found
    ctrl.posts.map(function(post) {
      if (!post.avatar) {
        post.avatar = 'https://fakeimg.pl/400x400/ccc/444/?text=' + post.user.username;
      }
    });

    this.offLCS = $rootScope.$on('$locationChangeSuccess', function(){
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
        parent.thread.poll.answers = pageData.thread.poll.answers;
        parent.pageCount = Math.ceil(parent.thread.post_count / parent.limit);
        calculatePollPercentage();
        $timeout($anchorScroll);
      });
    };

    parent.watchThread = function() {
      var params = { threadId: ctrl.thread.id };
      return Watchlist.watchThread(params).$promise
      .then(function() {
        ctrl.thread.watched = true;
        parent.thread.watched = true;
        Alert.success('This thread is being watched');
      })
      .catch(function(err) { Alert.error('Error watching this board'); });
    };

    this.avatarHighlight = function(color) {
      var style = {};
      if (color) {
        style.background = color;
        style.padding = '0.2rem';
      }
      return style;
    };

    this.usernameHighlight = function(color) {
      var style = {};
      if (color) {
        style.background = color;
        style.padding = '0 0.3rem';
        style.color = '#ffffff';
      }
      return style;
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

    function calculatePollPercentage() {
      if (!ctrl.thread.poll) { return; }

      ctrl.thread.poll.totalVotes = 0;
      ctrl.thread.poll.answers.forEach(function(answer) { ctrl.thread.poll.totalVotes += answer.votes; });
      ctrl.thread.poll.answers.map(function(answer) {
        var percentage = (answer.votes/ctrl.thread.poll.totalVotes) * 100 || 0;
        percentage = +percentage.toFixed(1);
        answer.style = { width: percentage + '%' };
        answer.percentage = percentage;
      });
    }
    parent.calculatePollPercentage = calculatePollPercentage;
  }
];

module.exports = angular.module('ept.posts.ctrl', [])
.controller('PostsCtrl', ctrl)
.name;
