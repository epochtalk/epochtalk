angular.module('ept')
  .factory('Auth', require('./auth.js'))
  .factory('AuthInterceptor', require('./authInterceptor.js'))
  .factory('BreadcrumbSvc', require('./breadcrumbs.js'))
  .factory('ViewInterceptor', require('./viewInterceptor.js'));
