var service = ['User', 'Session', 'PreferencesSvc', 'BanSvc', '$window', '$timeout', '$http', '$rootScope', '$q',
  function (User, Session, PreferencesSvc, BanSvc, $window, $timeout, $http, $rootScope, $q) {
    var clientId = $window.forumData.google_client_id;
    var apiKey = $window.forumData.google_api_key;
    var scopes = 'https://www.googleapis.com/auth/userinfo.email';
    var domain = 'dev.epochtalk.com:8080';
    var deferred = $q.defer();
    var token;

    function handleAuthResult(authResult) {
      if (authResult && !authResult.error) {
        token = authResult.access_token;
        return deferred.resolve(authResult);
      }
      else { return deferred.resolve('Error: There was an issue logging in with Google'); }
    }

    function handleCheckAuthResult(authResult) {
      if (authResult && !authResult.error) { return deferred.resolve(authResult); }
      else { return deferred.resolve(false); }
    }

    function initClient() {
      gapi.client.init({
        apiKey: apiKey,
        clientId: clientId,
        scope: scopes
      })
      .then(serviceAPI.checkAuth)
      .catch(console.log);
    }

    $window.initGapi = function () { gapi.load('client:auth2', initClient); };

    var serviceAPI = {
      signIn: function(username) {
        return new Promise(function(resolve) {
          if (token) { return resolve({ access_token: token }); }
          else { return resolve(gapi.auth.authorize({ client_id: clientId, scope: scopes, immediate: false, hd: domain }, handleAuthResult)); }
        })
        .then(function(authResult) {
          return User.authWithGoogle({ access_token: authResult.access_token, username: username }).$promise
        })
        .then(function(data) {
          if (data && data.has_account === false) { return { has_account: false }; }
          else {
            return new Promise(function(resolve) { return resolve(Session.setUser(data)); })
            .then(function() { PreferencesSvc.pullPreferences(); })
            .then(function() { $rootScope.$emit('loginEvent'); }); }
        });
      },
      checkAuth: function() {
        try {
          return gapi.auth.authorize({ client_id: clientId, scope: scopes, immediate: true, hd: domain }, handleCheckAuthResult);
        }
        catch(e) { return deferred.resolve(false);  }
      },
      signOut: function() {
        try {
          var auth2 = gapi.auth2.getAuthInstance();
          auth2.signOut().then(auth2.disconnect());
        }
        catch(e) {}
      }
    };

    return serviceAPI;
  }
];

angular.module('ept').service('GoogleAuth', service);
