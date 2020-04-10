var ctrl = [
  '$rootScope', '$scope', '$timeout', '$anchorScroll', '$location', 'Session', 'Patroller', 'Websocket', 'pageData',
  function($rootScope, $scope, $timeout, $anchorScroll, $location, Session, Patroller, Websocket, pageData) {
    var ctrl = this;
    var parent = $scope.$parent.PatrolParentCtrl;
    parent.loggedIn = Session.isAuthenticated;
    parent.page = Number(pageData.page);
    parent.limit = Number(pageData.limit);
    parent.hasMorePosts = pageData.hasMorePosts;
    parent.posts = pageData.posts;
    this.rootUrl = generateBaseUrl();
    this.user = Session.user;
    this.posts = pageData.posts;
    this.loadEditor = parent.loadEditor;
    this.openReportModal = parent.openReportModal;

    if ($location.hash().length) { $timeout($anchorScroll, 1000); }
    else { $timeout($anchorScroll); }

    // init function
    (function() {
      $timeout(function() { highlight($location.hash()); }, 500);
      checkUsersOnline();
    })();

    // Posts Permissions
    this.canUpdate = function(post) {
      if (!Session.isAuthenticated()) { return false; }
      if (!Session.hasPermission('posts.update.allow')) { return false; }

      var validBypass = false;
      // owner
      if (Session.hasPermission('posts.update.bypass.owner.admin')) { validBypass = true; }
      else if (Session.hasPermission('posts.update.bypass.owner.mod') && post.authed_user_is_mod) { validBypass = true; }
      else if (post.user.id === ctrl.user.id) { validBypass = true; }
      else if (Session.hasPermission('posts.update.bypass.owner.priority')) {
        if (Session.getPriority() < post.user.priority) { validBypass = true; }
      }


      // deleted
      if (post.deleted) {
        if (Session.hasPermission('posts.update.bypass.deleted.priority')) {
          if (Session.getPriority() < post.user.priority) { validBypass = true; }
        }
      }

      return validBypass;
    };

    parent.canPost = function() {
      if (!Session.isAuthenticated()) { return false; }

      if (Session.hasPermission('posts.update.allow')) { return true; }
      else { return false; }
    };

    this.canDelete = function(post) {
      if (!Session.isAuthenticated()) { return false; }
      if (!Session.hasPermission('posts.delete.allow')) { return false; }

      var validBypass = false;

      // moderated/owner
      if (Session.hasPermission('posts.delete.bypass.owner.admin')) { validBypass = true; }
      else if (Session.hasPermission('posts.delete.bypass.owner.mod') && post.authed_user_is_mod) { validBypass = true; }
      else if (post.user.id === ctrl.user.id) { validBypass = true; }
      else if (Session.hasPermission('posts.delete.bypass.owner.priority')) {
        if (Session.getPriority() < post.user.priority) { validBypass = true; }
      }

      return validBypass;
    };

    this.canPurge = function(post) {
      if (!Session.isAuthenticated()) { return false; }
      if (!Session.hasPermission('posts.purge.allow')) { return false; }
      var validBypass = false;
      // moderated/owner
      if (Session.hasPermission('posts.purge.bypass.purge.admin')) { validBypass = true; }
      else if (Session.hasPermission('posts.purge.bypass.purge.mod') && post.authed_user_is_mod) { validBypass = true; }
      else if (post.user.id === ctrl.user.id) { validBypass = true; }
      else if (Session.hasPermission('posts.purge.bypass.purge.priority')) {
        if (Session.getPriority() < post.user.priority) { validBypass = true; }
      }
      return validBypass;
    };

    this.canPostLock = function(post) {
      if (!Session.isAuthenticated()) { return false; }
      if (!Session.hasPermission('posts.lock.allow')) { return false; }

      if (Session.hasPermission('posts.lock.bypass.lock.admin')) { return true; }
      else if (Session.hasPermission('posts.lock.bypass.lock.mod') && post.authed_user_is_mod) { return true; }
      else if (Session.hasPermission('posts.lock.bypass.lock.priority')) {
        if (Session.getPriority() < post.user.priority) { return true; }
        else { return false; }
      }
      else { return false; }
    };

    parent.canPostLockQuick = function(index) {
      var post = ctrl.posts && ctrl.posts[index] || '';
      if (!post) { return false; }
      else { return ctrl.canPostLock(post); }
    };

    parent.changePage = function(increment) {
      var page = parent.page + increment;
      $location.search('page', page);
      $timeout($anchorScroll(), 1000);
    };

    this.offLCS = $rootScope.$on('$locationChangeSuccess', function() {
      var params = $location.search();
      var page = Number(params.page) || 1;
      var limit = Number(params.limit) || 25;
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
        page: parent.page,
        limit: parent.limit
      };

      // replace current posts with new posts
      Patroller.patrolPosts(query).$promise
      .then(function(pageData) {
        ctrl.posts = pageData.posts;
        parent.posts = pageData.posts;
        parent.hasMorePosts = pageData.hasMorePosts;
        checkUsersOnline();
      });
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

    function checkUsersOnline() {
      var uniqueUsers = {};
      ctrl.posts.forEach(function(post) {
        uniqueUsers[post.user.id] = 'user';
      });

      Object.keys(uniqueUsers).map(function(user) {
        return Websocket.isOnline(user, setOnline);
      });
    }

    function setOnline(err, data) {
      if (err) { return console.log(err); }
      else {
        ctrl.posts.map(function(post) {
          if (post.user.id === data.id) {
            post.user.online = data.online;
          }
        });
      }
    }
  }
];

module.exports = angular.module('bct.patroller.ctrl', [])
.controller('PatrolCtrl', ctrl);
