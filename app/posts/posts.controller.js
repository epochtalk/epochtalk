var ctrl = [
  '$rootScope', '$scope', '$timeout', '$anchorScroll', '$location', 'Alert', 'BanSvc', 'Watchlist', 'Session', 'Posts', 'pageData',
  function($rootScope, $scope, $timeout, $anchorScroll, $location, Alert, BanSvc, Watchlist, Session, Posts, pageData) {
    var ctrl = this;
    var parent = $scope.$parent.PostsParentCtrl;
    parent.loggedIn = Session.isAuthenticated;
    parent.page = Number(pageData.page);
    parent.limit = Number(pageData.limit);
    parent.posts = pageData.posts;
    parent.thread = pageData.thread;
    parent.board_id = pageData.thread.board_id;
    // TODO: This will not be here once actual boards are stored in this array
    parent.bannedFromBoard = BanSvc.banStatus().boards.length > 0;
    this.rootUrl = generateBaseUrl();
    this.user = Session.user;
    this.posts = pageData.posts;
    this.thread = pageData.thread;
    this.loadEditor = parent.loadEditor;
    this.addQuote = parent.addQuote;
    this.openReportModal = parent.openReportModal;

    if ($location.hash().length) { $timeout($anchorScroll, 1000); }
    else { $timeout($anchorScroll); }

    // Posts Permissions
    this.canPost = function() {
      if (!ctrl.loggedIn()) { return false; }
      if (BanSvc.banStatus().boards.length > 0) { return false; }
      if (!Session.hasPermission('posts.create.allow')) { return false; }

      if (ctrl.thread.locked) {
        if (Session.hasPermission('posts.create.bypass.locked.admin')) { return true; }
        else if (Session.hasPermission('posts.create.bypass.locked.mod')) {
          if (Session.moderatesBoard(ctrl.thread.board_id)) { return true; }
        }
        else { return false; }
      }

      return true;
    };

    this.canUpdate = function(post) {
      if (!Session.isAuthenticated()) { return false; }
      if (BanSvc.banStatus().boards.length > 0) { return false; }
      if (!Session.hasPermission('posts.update.allow')) { return false; }

      var validBypass = false;

      // locked
      if (ctrl.thread.locked) {
        if (Session.hasPermission('posts.update.bypass.locked.admin')) { validBypass = true; }
        else if (Session.hasPermission('posts.update.bypass.locked.mod')) {
          if (Session.moderatesBoard(ctrl.thread.board_id)) { validBypass = true; }
        }
        else { return false; }
      }

      // owner
      if (post.user.id === ctrl.user.id) { validBypass = true; }
      else {
        if (Session.hasPermission('posts.update.bypass.owner.admin')) { validBypass = true; }
        else if (Session.hasPermission('posts.update.bypass.owner.mod')) {
          if (Session.moderatesBoard(ctrl.thread.board_id)) { validBypass = true; }
        }
        else { return false; }
      }

      // deleted
      if (post.deleted) {
        if (Session.hasPermission('posts.update.bypass.deleted.admin')) { validBypass = true; }
        else if (Session.hasPermission('posts.update.bypass.deleted.mod')) {
          if (Session.moderatesBoard(ctrl.thread.board_id)) { validBypass = true; }
        }
        else { return false; }
      }

      return validBypass;
    };

    this.canDelete = function(post) {
      if (!Session.isAuthenticated()) { return false; }
      if (BanSvc.banStatus().boards.length > 0) { return false; }
      if (!Session.hasPermission('posts.delete.allow')) { return false; }

      var validBypass = false;

      // locked
      if (ctrl.thread.locked) {
        if (Session.hasPermission('posts.delete.bypass.locked.admin')) { validBypass = true; }
        else if (Session.hasPermission('posts.delete.bypass.locked.mod')) {
          if (Session.moderatesBoard(ctrl.thread.board_id)) { validBypass = true; }
        }
        else { return false; }
      }

      // moderated/owner
      if (post.user.id === ctrl.user.id) { validBypass = true; }
      else if (ctrl.thread.moderated && ctrl.thread.user.id === ctrl.user.id && Session.hasPermission('threads.moderated.allow')) { validBypass = true; }
      else if (Session.hasPermission('posts.delete.bypass.owner.admin')) { validBypass = true; }
      else if (Session.hasPermission('posts.delete.bypass.owner.mod')) {
        if (Session.moderatesBoard(ctrl.thread.board_id)) { validBypass = true; }
        else { return false; }
      }

      return validBypass;
    };

    this.canPurge = function() {
      if (!Session.isAuthenticated()) { return false; }
      if (BanSvc.banStatus().boards.length > 0) { return false; }
      if (!Session.hasPermission('posts.purge.allow')) { return false; }

      if (Session.hasPermission('posts.purge.bypass.purge.admin')) { return true; }
      else if (Session.hasPermission('posts.purge.bypass.purge.mod')) {
        if (Session.moderatesBoard(ctrl.thread.board_id)) { return true; }
      }
      else { return false; }
    };

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
        parent.thread.poll = pageData.thread.poll;
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
      .catch(function() { Alert.error('Error watching this board'); });
    };

    this.showEditDate = function(post) {
      return new Date(post.created_at) < new Date(post.updated_at);
    };

    this.avatarHighlight = function(color) {
      var style = {};
      if (color) { style.border = '0.225rem solid ' + color; }
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

      var totalVotes = 0;
      ctrl.thread.poll.answers.forEach(function(answer) { totalVotes += answer.votes; });
      ctrl.thread.poll.answers.map(function(answer) {
        var percentage = Math.ceil(answer.votes/totalVotes * 100) || 0;
        answer.style = { width: percentage + '%' };
        answer.percentage = percentage;
      });
    }
  }
];

module.exports = angular.module('ept.posts.ctrl', [])
.controller('PostsCtrl', ctrl)
.name;
