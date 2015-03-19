angular.module('ept')
  .factory('Page', require('./page.js'))
  .factory('Auth', require('./auth.js'))
  .factory('AuthInterceptor', require('./authInterceptor.js'))
  .factory('BreadcrumbSvc', require('./breadcrumbs.js'))
  .factory('ViewInterceptor', require('./viewInterceptor.js'))
  .factory('S3ImageUpload', require('./s3ImageUpload.js'));
