var ctrl = ['Alert', 'Websocket', 'Session', 'pageData', function(Alert, Websocket, Session, pageData) {
    var ctrl = this;
    this.loggedIn = Session.isAuthenticated;
    this.user = Session.user;
    this.posts = pageData;

    // Report Permission
    this.reportControlAccess = {
      reportPosts: Session.hasPermission('reports.createPostReport.allow'),
      reportUsers: Session.hasPermission('reports.createUserReport.allow')
    };

    console.log(this.reportControlAccess, ctrl.reportControlAccess);
    (function() { checkUsersOnline(); })();

        // Posts Permissions
    this.canUpdate = function(post) {
      if (!Session.isAuthenticated()) { return false; }
      if (!Session.hasPermission('posts.update.allow')) { return false; }

      var validBypass = false;
      // owner
      if (Session.hasPermission('posts.update.bypass.owner.admin')) { validBypass = true; }
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

    this.canDelete = function(post) {
      if (!Session.isAuthenticated()) { return false; }
      if (!Session.hasPermission('posts.delete.allow')) { return false; }

      var validBypass = false;

      // moderated/owner
      if (Session.hasPermission('posts.delete.bypass.owner.admin')) { validBypass = true; }
      else if (post.user.id === ctrl.user.id) { validBypass = true; }
      else if (Session.hasPermission('posts.delete.bypass.owner.priority')) {
        if (Session.getPriority() < post.user.priority) { validBypass = true; }
      }

      return validBypass;
    };

    this.canPostLock = function(post) {
      if (!Session.isAuthenticated()) { return false; }
      if (!Session.hasPermission('posts.lock.allow')) { return false; }

      if (Session.hasPermission('posts.lock.bypass.lock.admin')) { validBypass = true; }
      else if (Session.hasPermission('posts.lock.bypass.lock.priority')) {
        if (Session.getPriority() < post.user.priority) { return true; }
        else { return false; }
      }
      else { return false; }
    };


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

  }
];

module.exports = angular.module('bct.patroller.newbieCtrl', [])
.controller('NewbieCtrl', ctrl)
.name;
