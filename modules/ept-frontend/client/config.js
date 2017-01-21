module.exports = ['$stateProvider', '$urlRouterProvider', '$locationProvider', '$httpProvider', 'cfpLoadingBarProvider',
  function($stateProvider, $urlRouterProvider, $locationProvider, $httpProvider, cfpLoadingBarProvider) {

    // Public layout
    $stateProvider.state('public-layout', {
      views: {
        'header': { template: require('./layout/header.html') },
        'body': { template: require('./layout/public-content.html') },
        'modals': { template: require('./layout/modals.html') }
      }
    });

    $stateProvider.state('login', {
      parent: 'public-layout',
      views: {
        'content': {
          controller: 'HeaderCtrl',
          controllerAs: 'HeaderCtrl',
          templateUrl: '/static/templates/layout/login.html'
        }
      },
      resolve: { $title: function() { return 'Login'; } }
    });

    $stateProvider.state('403', {
      parent: 'public-layout',
      views: {
        'header': { template: require('./layout/header.html') },
        'content': { template: require('./layout/403.html') }
      },
      resolve: { $title: function() { return 'Private Forum'; } }
    });

    $stateProvider.state('404', {
      parent: 'public-layout',
      views: {
        'header': { template: require('./layout/header.html') },
        'content': { template: require('./layout/404.html') }
      },
      resolve: { $title: function() { return '404 Not Found'; } }
    });

    $stateProvider.state('503', {
      parent: 'public-layout',
      views: {
        'header': { template: require('./layout/header.html') },
        'content': { template: require('./layout/503.html') }
      },
      resolve: { $title: function() { return '503 Service Unavailable'; } }
    });

    $stateProvider.state('home', {
      parent: 'public-layout',
      url: '/',
      views: {
        'content': {
          controller: ['$rootScope', '$state', function($rootScope, $state) {
            var action;
            var enabled = $rootScope.$webConfigs.portal.enabled;

            // fork between portal and boards here
            if (enabled) { action = $state.go('portal', {}, { reload: true }); }
            else { action = $state.go('boards', {}, { reload: true }); }

            return action.catch(function(err) {
              if (err.status === 403) { throw err; }
              else {
                $rootScope.$webConfigs.portal.enabled = false;
                $state.go('boards', {}, { reload: true });
              }
            });
          }]
        }
      },
    });

    // 404 without redirecting user from current url
    $urlRouterProvider.otherwise(function($injector){
       var state = $injector.get('$state');
       state.go('404');
       return true;
    });

    $locationProvider.html5Mode(true);
    $locationProvider.hashPrefix('!');
    $httpProvider.interceptors.push('AuthInterceptor');
    $httpProvider.interceptors.push('ViewInterceptor');
    // loading bar latency (For testing only)
    cfpLoadingBarProvider.latencyThreshold = 10;
  }
];
