module.exports = ['$stateProvider', '$urlRouterProvider', function($stateProvider, $urlRouterProvider) {
  // Checks if a user is a admin
  var adminCheck = function(route) {
    return ['$q', 'Session', function($q, Session) {
      if (!Session.isAuthenticated()) {  return $q.reject({ status: 401, statusText: 'Unauthorized' }); }
      if (route && Session.hasPermission('adminAccess' + '.' + route)) { return true; }
      else if (!route && Session.hasPermission('adminAccess')) { return true; }
      else { return $q.reject({ status: 403, statusText: 'Forbidden' }); }
    }];
  };

  var adminManagementRedirect = ['$state', 'Session', function($state, Session) {
    if (Session.hasPermission('adminAccess.management.boards')) {
      $state.go('admin-management.boards', {}, {location: 'replace'});
    }
    else if (Session.hasPermission('adminAccess.management.users')) {
      $state.go('admin-management.users', {}, {location: 'replace'});
    }
    else if (Session.hasPermission('adminAccess.management.roles')) {
      $state.go('admin-management.roles', {}, {location: 'replace'});
    }
    else if (Session.hasPermission('adminAccess.management.bannedAddresses')) {
      $state.go('admin-management.banned-addresses', {}, {location: 'replace'});
    }
    else if (Session.hasPermission('adminAccess.management.invitations')) {
      $state.go('admin-management.invitations', {}, {location: 'replace'});
    }
    else { $state.go('home', {}, {location: 'replace'}); }
  }];

  // Default child state for admin-management is users
  $urlRouterProvider.when('/admin/management', adminManagementRedirect);
  $urlRouterProvider.when('/admin/management/', adminManagementRedirect);

  $stateProvider.state('admin-management', {
    url: '/admin/management',
    reloadOnSearch: false,
    parent: 'admin-layout',
    views: {
      'content': {
        controller: ['Session', function(Session) {
          this.hasPermission = Session.hasPermission;
          this.tab = null;
          if (Session.hasPermission('adminAccess.management.boards')) { this.tab = 'boards'; }
          else if (Session.hasPermission('adminAccess.management.users')) { this.tab = 'users'; }
          else if (Session.hasPermission('adminAccess.management.roles')) { this.tab = 'roles'; }
        }],
        controllerAs: 'AdminManagementCtrl',
        templateUrl: '/static/templates/admin/management/index.html'
      }
    },
    resolve: { userAccess: adminCheck('management') }
  })
  .state('admin-management.boards', {
    url: '/boards?saved',
    views: {
      'data@admin-management': {
        controller: 'CategoriesCtrl',
        controllerAs: 'AdminManagementCtrl',
        templateUrl: '/static/templates/admin/management/boards.html'
      }
    },
    resolve: {
      userAccess: adminCheck('management.boards'),
      $title: function() { return 'Board Management'; },
      loadCtrl: ['$q', '$ocLazyLoad', function($q, $ocLazyLoad) {
        var deferred = $q.defer();
        require.ensure([], function() {
          require('./boards.controller');
          $ocLazyLoad.load([
            { name: 'ept.admin.management.boards.ctrl' },
            { name: 'ept.directives.category-editor'},
            { name: 'ept.directives.nestable-boards'},
            { name: 'ept.directives.nestable-categories'},
            { name: 'ept.directives.setModerators' }
          ]);
          deferred.resolve();
        });
        return deferred.promise;
      }],
      roleData: ['Roles', function(Roles) { return Roles.all().$promise; }],
      categories: ['Boards', function(Boards) { return Boards.unfiltered().$promise; }],
      boards: ['Boards', function(Boards) { console.log(Boards); return Boards.uncategorized().$promise; }]
    }
  })
  .state('admin-management.users', {
    url: '/users?page&limit&field&desc&filter&search&ip',
    reloadOnSearch: false,
    views: {
      'data@admin-management': {
        controller: 'UsersCtrl',
        controllerAs: 'AdminManagementCtrl',
        templateUrl: '/static/templates/admin/management/users.html'
      }
    },
    resolve: {
      userAccess: adminCheck('management.users'),
      $title: function() { return 'User Management'; },
      loadCtrl: ['$q', '$ocLazyLoad', function($q, $ocLazyLoad) {
        var deferred = $q.defer();
        require.ensure([], function() {
          require('./users.controller');
          $ocLazyLoad.load([
            { name: 'ept.admin.management.users.ctrl' },
            { name: 'ept.directives.image-uploader' },
          ]);
          deferred.resolve();
        });
        return deferred.promise;
      }],
      users: ['User', '$stateParams', function(User, $stateParams) {
        var query = {
          field: $stateParams.field,
          desc: $stateParams.desc,
          limit: Number($stateParams.limit) || 15,
          page: Number($stateParams.page) || 1,
          filter: $stateParams.filter,
          search: $stateParams.search,
          ip: $stateParams.ip
        };
        return User.page(query).$promise;
      }],
      usersCount: ['User', '$stateParams', function(User, $stateParams) {
        var opts;
        var filter = $stateParams.filter;
        var search = $stateParams.search;
        var ip = $stateParams.ip;
        if (filter || search) {
          opts = {
            filter: filter,
            search: search,
            ip: ip
          };
        }
        return User.count(opts).$promise
        .then(function(usersCount) { return usersCount.count; });
      }],
      field: ['$stateParams', function($stateParams) {
        return $stateParams.field;
      }],
      desc: ['$stateParams', function($stateParams) {
        return $stateParams.desc || false;
      }],
      page: ['$stateParams', function($stateParams) {
        return Number($stateParams.page) || 1;
      }],
      limit: ['$stateParams', function($stateParams) {
        return Number($stateParams.limit) || 15;
      }],
      filter: ['$stateParams', function($stateParams) {
        return $stateParams.filter;
      }],
      search: ['$stateParams', function($stateParams) {
        return $stateParams.search;
      }],
      ip: ['$stateParams', function($stateParams) {
        return $stateParams.ip === 'true';
      }]
    }
  })
  .state('admin-management.roles', {
    url: '/roles?roleId&page&field&desc&limit&search',
    reloadOnSearch: false,
    views: {
      'data@admin-management': {
        controller: 'RolesCtrl',
        controllerAs: 'AdminManagementCtrl',
        templateUrl: '/static/templates/admin/management/roles.html'
      }
    },
    resolve: {
      userAccess: adminCheck('management.roles'),
      $title: function() { return 'Roles Management'; },
      loadCtrl: ['$q', '$ocLazyLoad', function($q, $ocLazyLoad) {
        var deferred = $q.defer();
        require.ensure([], function() {
          require('./roles.controller');
          $ocLazyLoad.load({ name: 'ept.admin.management.roles.ctrl' });
          deferred.resolve();
        });
        return deferred.promise;
      }],
      pageData: ['Roles', function(Roles) {
        return Roles.all().$promise
        .then(function(pageData) { return pageData; });
      }],
      page: ['$stateParams', function($stateParams) {
        return Number($stateParams.page) || 1;
      }],
      limit: ['$stateParams', function($stateParams) {
        return Number($stateParams.limit) || 15;
      }],
      roleId: ['$stateParams', function($stateParams) {
        return $stateParams.roleId;
      }],
      search: ['$stateParams', function($stateParams) {
        return $stateParams.search;
      }],
      userData: ['Roles', '$stateParams', function(Roles, $stateParams) {
        var query = {
          id: $stateParams.roleId,
          page: Number($stateParams.page) || 1,
          limit: Number($stateParams.limit) || 15,
          search: $stateParams.search
        };
        return Roles.users(query).$promise
        .then(function(userData) { return userData; });
      }]
    }
  })
  .state('admin-management.banned-addresses', {
    url: '/bannedaddresses?page&limit&field&desc&search',
    reloadOnSearch: false,
    views: {
      'data@admin-management': {
        controller: 'BannedAddressesCtrl',
        controllerAs: 'AdminManagementCtrl',
        templateUrl: '/static/templates/admin/management/banned-addresses.html'
      }
    },
    resolve: {
      userAccess: adminCheck('management.bannedAddresses'),
      $title: function() { return 'Banned Addresses Management'; },
      loadCtrl: ['$q', '$ocLazyLoad', function($q, $ocLazyLoad) {
        var deferred = $q.defer();
        require.ensure([], function() {
          require('./banned-addresses.controller');
          $ocLazyLoad.load({ name: 'ept.admin.management.bannedAddresses.ctrl' });
          deferred.resolve();
        });
        return deferred.promise;
      }],
      bannedAddresses: ['Bans', '$stateParams', function(Bans, $stateParams) {
        var query = {
          field: $stateParams.field,
          desc: $stateParams.desc,
          limit: Number($stateParams.limit) || 25,
          page: Number($stateParams.page) || 1,
          search: $stateParams.search
        };
        return Bans.pageBannedAddresses(query).$promise;
      }]
    }
  })
  .state('admin-management.invitations', {
    url: '/invitations?page&limit',
    reloadOnSearch: false,
    views: {
      'data@admin-management': {
        controller: 'InvitationsCtrl',
        controllerAs: 'AdminManagementCtrl',
        templateUrl: '/static/templates/admin/management/invitations.html'
      }
    },
    resolve: {
      userAccess: adminCheck('management.invitations'),
      $title: function() { return 'Invitations'; },
      loadCtrl: ['$q', '$ocLazyLoad', function($q, $ocLazyLoad) {
        var deferred = $q.defer();
        require.ensure([], function() {
          require('./invitations.controller');
          $ocLazyLoad.load({ name: 'ept.admin.management.invitations.ctrl' });
          deferred.resolve();
        });
        return deferred.promise;
      }],
      pageData: ['User', '$stateParams', function(User, $stateParams) {
        var query = {
          limit: Number($stateParams.limit) || 25,
          page: Number($stateParams.page) || 1,
        };
        return User.inviteList(query).$promise;
      }]
    }
  });
}];
