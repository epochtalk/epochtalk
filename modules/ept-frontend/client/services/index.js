angular.module('ept')
  .service('ViewInterceptor', require('./viewInterceptor.js'))
  .service('Session', require('./session.js'))
  .service('Alert', require('./alert.js'))
  .service('Websocket', require('./websocket.js'));
