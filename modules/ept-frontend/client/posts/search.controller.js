var ctrl = ['Posts', '$rootScope', '$scope', '$anchorScroll','$location', '$timeout', '$stateParams', 'Auth', 'Alert', 'pageData', 'Websocket',
  function(Posts, $rootScope, $scope, $anchorScroll, $location, $timeout, $stateParams, Auth, Alert, pageData, Websocket) {
    var ctrl = this;
    this.posts = pageData.posts;
    this.count = pageData.count;
    this.page = pageData.page;
    this.limit = pageData.limit;
    this.prev = pageData.prev;
    this.next = pageData.next;
    this.field = pageData.field;
    this.desc = pageData.desc;
    this.search = pageData.search;
    this.queryParams = $location.search();
    this.searchStr = pageData.search;

    // init function
    (function() { checkUsersOnline(); })();

    this.searchPosts = function() {
      ctrl.collapseMobileKeyboard();
      if (!ctrl.searchStr.length) {
        ctrl.clearSearch();
        return;
      }
      ctrl.queryParams = { search: ctrl.searchStr };
      $location.search(ctrl.queryParams);
    };

    this.collapseMobileKeyboard = function() { document.activeElement.blur(); };

    this.clearSearch = function() {
      ctrl.queryParams = {};
      $location.search(ctrl.queryParams);
      ctrl.searchStr = null;
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

    $timeout($anchorScroll);

    this.offLCS = $rootScope.$on('$locationChangeSuccess', function() {
      var params = $location.search();
      var page = Number(params.page) || 1;
      var limit = Number(params.limit) || 25;
      var field = params.field;
      var search = params.search;
      var descending = params.desc === 'true';
      var pageChanged = false;
      var limitChanged = false;
      var fieldChanged = false;
      var descChanged = false;
      var searchChanged = false;

      if (page && page !== ctrl.page) {
        pageChanged = true;
        ctrl.page = page;
      }
      if (limit && limit !== ctrl.limit) {
        limitChanged = true;
        ctrl.limit = limit;
      }
      if (field && field !== ctrl.field) {
        fieldChanged = true;
        ctrl.field = field;
      }
      if (descending !== ctrl.desc) {
        descChanged = true;
        ctrl.desc = descending;
      }
      if ((search === undefined || search) && search !== ctrl.search) {
        searchChanged = true;
        ctrl.searchStr = search;
      }
      if(pageChanged || limitChanged || fieldChanged || descChanged || searchChanged) { ctrl.pullPage(); }
    });
    $scope.$on('$destroy', function() { ctrl.offLCS(); });

    this.pullPage = function() {
      var query = {
        page: ctrl.page,
        limit: ctrl.limit,
        desc: ctrl.desc,
        field: ctrl.field,
        search: ctrl.searchStr
      };

      // replace current users with new users
      Posts.search(query).$promise
      .then(function(updatedData) {
        ctrl.posts = updatedData.posts;
        ctrl.count = updatedData.count;
        ctrl.page = updatedData.page;
        ctrl.prev = updatedData.prev;
        ctrl.next = updatedData.next;
        ctrl.limit = updatedData.limit;
        ctrl.search = updatedData.search;
        $timeout($anchorScroll);
        checkUsersOnline();
      });
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

  }
];


module.exports = angular.module('ept.postsearch.ctrl', [])
.controller('PostSearchCtrl', ctrl)
.name;
