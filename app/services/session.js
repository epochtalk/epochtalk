'use strict';

module.exports = ['$http',
  function($http) {
    var Session = {
      data: {},
      saveSession: function() { /* save session data to db */ },
      updateSession: function() {
        /* load data from db */
        Session.data = $http.get('session.json').then(function(r) { return r.data;});
      }
    };
    Session.updateSession();
    return Session;
  }
];
