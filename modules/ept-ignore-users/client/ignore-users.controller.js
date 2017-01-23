var ctrl = ['$anchorScroll', '$timeout', 'Session',  'IgnoreUsers', 'pageData', 'Alert',
  function($anchorScroll, $timeout, Session, IgnoreUsers, pageData, Alert) {
    // page variables
    var ctrl = this;
    this.loggedIn = Session.isAuthenticated;

    // index variables
    this.page = pageData.page;
    this.limit = pageData.limit;
    this.users = pageData.ignored;
    this.hasMore = pageData.hasMore;

    this.userToIgnore = {};

    // Scroll fix for nested state
    $timeout($anchorScroll);

    // page actions

    this.unignore = function(user) {
      return IgnoreUsers.unignore({userId: user.id}).$promise
      .then(function() { $timeout(function() { user.ignored = false; }); });
    };

    this.ignore = function(user) {
      return IgnoreUsers.ignore({userId: user.id}).$promise
      .then(function(res) { $timeout(function() { user.ignored = true; }); return res; });
    };

    this.ignoreUser = function() {
      ctrl.ignore(ctrl.userToIgnore)
      .then(function(results) {
        if (results.ignored) {
          Alert.success('Successfully ignored user ' + ctrl.userToIgnore.username);
        }
        else if (results) {
          Alert.info('User ' + ctrl.userToIgnore.username + ' is already being ignored');
        }
        else {
          Alert.error('There was an error ignoring user ' + ctrl.userToIgnore.username);
        }
        ctrl.pullPage(0);
        ctrl.userToIgnore = {};
      });
    };

    // page view styleing

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

    // page controls
    this.pullPage = function(pageIncrement) {
      ctrl.page = ctrl.page + pageIncrement;
      var query = { page: ctrl.page, limit: ctrl.limit };

      // replace current threads with new threads
      IgnoreUsers.ignored(query).$promise
      .then(function(pageData) {
        ctrl.hasMore = pageData.hasMore;
        ctrl.users = pageData.ignored;
        $timeout($anchorScroll);
      });
    };

  }
];

module.exports = angular.module('ept.ignore-users.ctrl', [])
.controller('IgnoreUsersCtrl', ctrl)
.name;
