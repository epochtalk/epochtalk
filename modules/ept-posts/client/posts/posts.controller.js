var ctrl = [
  '$rootScope', '$scope', '$timeout', '$anchorScroll', '$location', 'Alert', 'BanSvc', 'Watchlist', 'Session', 'Posts', 'pageData', 'Websocket',
  function($rootScope, $scope, $timeout, $anchorScroll, $location, Alert, BanSvc, Watchlist, Session, Posts, pageData, Websocket) {
    var ctrl = this;
    var parent = $scope.$parent.PostsParentCtrl;
    parent.pageData = pageData;
    parent.loggedIn = Session.isAuthenticated;
    parent.page = Number(pageData.page);
    parent.limit = Number(pageData.limit);
    parent.posts = pageData.posts;
    parent.thread = pageData.thread;
    parent.board_id = pageData.thread.board_id;
    parent.writeAccess = pageData.write_access;
    parent.bannedFromBoard = BanSvc.banStatus();
    parent.disablePostEdit = pageData.board.disable_post_edit;
    parent.disableSignature = pageData.board.disable_signature;
    this.rootUrl = generateBaseUrl();
    this.user = Session.user;
    this.posts = pageData.posts;
    this.thread = pageData.thread;
    this.disablePostEdit = pageData.board.disable_post_edit;
    this.moderators = pageData.board.moderators.map(function(data) {
      return data.id;
    });
    this.loadEditor = parent.loadEditor;
    this.addQuote = parent.addQuote;
    this.copyQuote = parent.copyQuote;
    this.openReportModal = parent.openReportModal;

    if ($location.hash().length) {
      if($location.search().start && $location.search().page) {
        delete $location.$$search.page;
        $location.$$compose();
      }
      $timeout(function() { highlight($location.hash()); }, 1000);
    }
    else { $timeout($anchorScroll); }

    // Posts Permissions
    this.canPost = function() {
      if (!pageData.write_access) { return false; }
      if (!Session.isAuthenticated()) { return false; }
      if (BanSvc.banStatus()) { return false; }
      if (!Session.hasPermission('posts.create.allow')) { return false; }

      if (ctrl.thread.locked) {
        if (Session.hasPermission('posts.create.bypass.locked.admin')) { return true; }
        else if (Session.hasPermission('posts.create.bypass.locked.mod')) {
          if (Session.moderatesBoard(ctrl.thread.board_id)) { return true; }
          else { return false; }
        }
        else { return false; }
      }

      return true;
    };

    this.canUpdate = function(post) {
      var elevatedPrivileges = Session.hasPermission('posts.update.bypass.owner.admin') || Session.hasPermission('posts.update.bypass.locked.mod') || Session.hasPermission('posts.update.bypass.locked.priority');
      if (!pageData.write_access) { return false; }
      if (!Session.isAuthenticated()) { return false; }
      if (!Session.hasPermission('posts.update.allow')) { return false; }
      if (BanSvc.banStatus()) { return false; }
      // Shim for old disablePostEdit
      if (ctrl.disablePostEdit === true && !elevatedPrivileges) { return false; }
      // Check time on disablePostEdit
      if (ctrl.disablePostEdit && Number(ctrl.disablePostEdit) > -1 && !elevatedPrivileges) {
        var currentTime = new Date().getTime();
        var minutes = Number(ctrl.disablePostEdit) * 60 * 1000;
        var postCreatedAt = new Date(post.created_at).getTime();
        var canUpdate = currentTime - postCreatedAt < minutes;
        if (!canUpdate) { return false; }
      }

      var validBypass = false;

      // locked
      if (ctrl.thread.locked) {
        if (Session.hasPermission('posts.update.bypass.locked.admin')) { validBypass = true; }
        else if (Session.hasPermission('posts.update.bypass.locked.mod')) {
          if (Session.moderatesBoard(ctrl.thread.board_id) && ctrl.user.id === post.user.id) { validBypass = true; }
          else if (Session.moderatesBoard(ctrl.thread.board_id) && Session.getPriority() < post.user.priority) { validBypass = true; }
          else if (Session.moderatesBoard(ctrl.thread.board_id) && (Session.getPriority() === post.user.priority && !ctrl.moderators.includes(post.user.id))) {
            validBypass = true;
          }
        }
        else if (Session.hasPermission('posts.update.bypass.locked.priority')) {
          if (Session.getPriority() < post.user.priority) { validBypass = true; }
        }
      }

      // owner
      if (post.user.id === ctrl.user.id && !ctrl.thread.locked) { validBypass = true; }
      else {
        if (Session.hasPermission('posts.update.bypass.owner.admin')) { validBypass = true; }
        else if (Session.hasPermission('posts.update.bypass.owner.mod')) {
          if (Session.moderatesBoard(ctrl.thread.board_id) && Session.getPriority() < post.user.priority) { validBypass = true; }
          // Check if mod is moderating another board's mod (which is allowed)
          else if (Session.moderatesBoard(ctrl.thread.board_id) && (Session.getPriority() === post.user.priority && !ctrl.moderators.includes(post.user.id))) {
            validBypass = true;
          }
        }
        else if (Session.hasPermission('posts.update.bypass.owner.priority')) {
          if (Session.getPriority() < post.user.priority) { validBypass = true; }
        }
      }

      // deleted
      if (post.deleted) {
        if (Session.hasPermission('posts.update.bypass.deleted.admin')) { validBypass = true; }
        else if (Session.hasPermission('posts.update.bypass.deleted.mod')) {
          if (Session.moderatesBoard(ctrl.thread.board_id) && Session.getPriority() < post.user.priority) { validBypass = true; }
          else if (Session.moderatesBoard(ctrl.thread.board_id) && (Session.getPriority() === post.user.priority && !ctrl.moderators.includes(post.user.id))) {
            validBypass = true;
          }
        }
        else if (Session.hasPermission('posts.update.bypass.deleted.priority')) {
          if (Session.getPriority() < post.user.priority) { validBypass = true; }
        }
      }

      return validBypass;
    };

    this.canDelete = function(post) {
      if (!pageData.write_access) { return false; }
      if (!Session.isAuthenticated()) { return false; }
      if (BanSvc.banStatus()) { return false; }
      if (!Session.hasPermission('posts.delete.allow')) { return false; }

      var validBypass = false;

      // locked
      if (ctrl.thread.locked) {
        if (Session.hasPermission('posts.delete.bypass.locked.admin')) { validBypass = true; }
        else if (Session.hasPermission('posts.delete.bypass.locked.mod')) {
          if (Session.moderatesBoard(ctrl.thread.board_id) && Session.getPriority() < post.user.priority) { validBypass = true; }
          // Check if mod is moderating another board's mod (which is allowed)
          else if (Session.moderatesBoard(ctrl.thread.board_id) && (Session.getPriority() === post.user.priority && !ctrl.moderators.includes(post.user.id))) {
            validBypass = true;
          }
        }
        else if (Session.hasPermission('posts.delete.bypass.locked.priority')) {
          if (Session.getPriority() < post.user.priority) { validBypass = true; }
          else if (Session.hasPermission('threads.moderated.allow') && ctrl.thread.user.id === ctrl.user.id && parent.thread.moderated && ctrl.user.id !== post.user.id && Session.getPriority() <= post.user.priority) { validBypass = true; }
        }
      }

      // moderated/owner
      if (post.user.id === ctrl.user.id) { validBypass = true; }
      else if (ctrl.thread.moderated && ctrl.thread.user.id === ctrl.user.id && Session.hasPermission('threads.moderated.allow') && Session.hasPermission('posts.delete.bypass.owner.selfMod') && Session.getPriority() <= post.user.priority) { validBypass = true; }
      else if (Session.hasPermission('posts.delete.bypass.owner.admin')) { validBypass = true; }
      else if (Session.hasPermission('posts.delete.bypass.owner.mod')) {
        if (Session.moderatesBoard(ctrl.thread.board_id) && Session.getPriority() < post.user.priority) { validBypass = true; }
        // Check if mod is moderating another board's mod (which is allowed)
        else if (Session.moderatesBoard(ctrl.thread.board_id) && (Session.getPriority() === post.user.priority && !ctrl.moderators.includes(post.user.id))) {
          validBypass = true;
        }
      }
      else if (Session.hasPermission('posts.delete.bypass.owner.priority')) {
        if (Session.getPriority() < post.user.priority) { validBypass = true; }
        else if (Session.hasPermission('threads.moderated.allow') && ctrl.thread.user.id === ctrl.user.id && parent.thread.moderated && ctrl.user.id !== post.user.id && Session.getPriority() <= post.user.priority) { validBypass = true; }
      }

      return validBypass;
    };

    this.canPostLock = function(post) {
      if (!pageData.write_access) { return false; }
      if (!Session.isAuthenticated()) { return false; }
      if (BanSvc.banStatus()) { return false; }
      if (!Session.hasPermission('posts.lock.allow')) { return false; }

      if (Session.hasPermission('posts.lock.bypass.lock.admin')) { return true; }
      else if (Session.hasPermission('posts.lock.bypass.lock.mod')) {
        if (Session.moderatesBoard(ctrl.thread.board_id) && Session.getPriority() < post.user.priority) { return true; }
        // Check if mod is moderating another board's mod (which is allowed)
        else if (Session.moderatesBoard(ctrl.thread.board_id) && (Session.getPriority() === post.user.priority && !ctrl.moderators.includes(post.user.id))) {
          return true;
        }
        else { return false; }
      }
      else if (Session.hasPermission('posts.lock.bypass.lock.priority')) {
        if (Session.getPriority() < post.user.priority) { return true; }
        // Allow users with priority option to still self mod
        else if (Session.hasPermission('threads.moderated.allow') && ctrl.thread.user.id === ctrl.user.id && parent.thread.moderated && ctrl.user.id !== post.user.id && Session.getPriority() <= post.user.priority) { return true; }
        else { return false; }
      }
      else if (Session.hasPermission('threads.moderated.allow') && Session.hasPermission('posts.lock.bypass.lock.selfMod') && Session.getPriority() <= post.user.priority) {
        if (ctrl.thread.user.id === ctrl.user.id && parent.thread.moderated && ctrl.user.id !== post.user.id) {
          return true;
        }
        else { return false; }
      }
      else { return false; }
    };

    parent.canPostLockQuick = function(index) {
      var post = ctrl.posts && ctrl.posts[index] || '';
      if (!post) { return false; }
      else { return ctrl.canPostLock(post); }
    };

    this.canPurge = function(post) {
      if (!pageData.write_access) { return false; }
      if (!Session.isAuthenticated()) { return false; }
      if (BanSvc.banStatus()) { return false; }
      if (!Session.hasPermission('posts.purge.allow')) { return false; }

      if (Session.hasPermission('posts.purge.bypass.purge.admin')) { return true; }
      else if (Session.hasPermission('posts.purge.bypass.purge.mod')) {
        if (Session.moderatesBoard(ctrl.thread.board_id) && (Session.getPriority() < post.user.priority || post.user.id === ctrl.user.id)) { return true; }
        else if (Session.moderatesBoard(ctrl.thread.board_id) && (Session.getPriority() === post.user.priority && !ctrl.moderators.includes(post.user.id))) {
          return true;
        }
        else { return false; }
      }
      else { return false; }
    };

    // init function
    (function() {
      calculatePollPercentage();
      parent.pageCount = Math.ceil(parent.thread.post_count / parent.limit);
      checkUsersOnline();
    })();

    this.offLCS = $rootScope.$on('$locationChangeSuccess', function() {
      var params = $location.search();
      var page = Number(params.page) || 1;
      var start = params.start;
      var limit = Number(params.limit);
      var pageChanged = false;
      var limitChanged = false;
      if (page && page !== parent.page && !start) {
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
        page: isNaN($location.search().start) ? parent.page : undefined,
        limit: parent.limit,
        start: isNaN($location.search().start) ? undefined : Number($location.search().start)
      };

      // replace current posts with new posts
      Posts.byThread(query).$promise
      .then(function(pageData) {
        ctrl.posts = pageData.posts;
        parent.writeAccess = pageData.write_access;
        parent.posts = pageData.posts;
        parent.thread.post_count = pageData.thread.post_count;
        parent.thread.poll = pageData.thread.poll;
        parent.page = pageData.page;
        parent.pageCount = Math.ceil(parent.thread.post_count / parent.limit);
        calculatePollPercentage();
        checkUsersOnline();
        ctrl.highlightPost();
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
      $timeout(function() {
        highlight($location.hash());
        $anchorScroll();
      });
    };

    function highlight(postId) {
      if ($location.search().purged === 'true') { purgeSuccess(); }
      else {
        ctrl.posts.map(function(post) {
          if (post.id === postId) { post.highlighted = true; }
          else { post.highlighted = false; }
        });
      }
    }

    function purgeSuccess() {
      if ($location.search().start && $location.hash().length && $location.search().purged) {
        Alert.success('Sucessfully purged post!');
        delete $location.$$search.purged;
        $location.$$compose();
      }
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

module.exports = angular.module('ept.posts.ctrl', [])
.controller('PostsCtrl', ctrl)
.name;
