module.exports = ['$stateProvider', '$urlRouterProvider', '$locationProvider', '$httpProvider', 'cfpLoadingBarProvider',
  function($stateProvider, $urlRouterProvider, $locationProvider, $httpProvider, cfpLoadingBarProvider) {

    // Public layout
    $stateProvider.state('public-layout', {
      views: {
        'header': { template: require('./layout/header.html') },
        'body': { template: require('./layout/public-content.html') },
        'footer': { template: require('./layout/footer.html') },
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

    $stateProvider.state('404', {
      views: { 'body': { templateUrl: '/static/templates/layout/404.html' } },
      resolve: { $title: function() { return '404 Not Found'; } }
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
