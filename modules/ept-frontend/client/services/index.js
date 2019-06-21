angular.module('ept')
  .service('Auth', require('./auth.js'))
  .service('AuthInterceptor', require('./authInterceptor.js'))
  .service('ViewInterceptor', require('./viewInterceptor.js'))
  .service('Session', require('./session.js'))
  .service('Alert', require('./alert.js'))
  .service('Websocket', require('./websocket.js'));
