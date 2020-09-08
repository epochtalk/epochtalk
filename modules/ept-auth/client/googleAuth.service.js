var service = ['User', 'Session', 'PreferencesSvc', 'BanSvc', '$window', '$timeout', '$http', '$rootScope', '$q',
  function (User, Session, PreferencesSvc, BanSvc, $window, $timeout, $http, $rootScope, $q) {
    var clientId = $window.forumData.google_client_id;
    var apiKey = $window.forumData.google_api_key;
    var scopes = 'https://www.googleapis.com/auth/userinfo.email';
    var domain = 'dev.epochtalk.com:8080';
    var deferred = $q.defer();


    function handleAuthResult(authResult) {
      console.log('Attempt Handle Auth');
      if (authResult && !authResult.error) { return deferred.resolve(authResult); }
      else { return deferred.reject('Error: There was an issue logging in with Google'); }
    }

    function handleCheckAuthResult(authResult) {
      console.log('Attempt handleCheckAuthResult');
      if (authResult && !authResult.error) {
        console.log('User is authenticated', authResult);
        return deferred.resolve(authResult);
      }
      else {
        console.log('User is NOT authenticated');
        return deferred.resolve(false);
      }
    }

    function initClient() {
      console.log('Attempt Init');
      gapi.client.init({
        apiKey: apiKey,
        clientId: clientId,
        scope: scopes
      })
      .then(serviceAPI.checkAuth);
    }

    $window.initGapi = function () { gapi.load('client:auth2', initClient); };

    var serviceAPI = {
      attemptAuth: function() {
        console.log('Attempt Auth');
        return gapi.auth.authorize({ client_id: clientId, scope: scopes, immediate: false, hd: domain }, handleAuthResult)
        .then(function(authResult) {
          return User.authWithGoogle({ access_token: authResult.access_token }).$promise
        })
        .then(function(resource) { Session.setUser(resource); })
        .then(function() { PreferencesSvc.pullPreferences(); })
        .then(function() { $rootScope.$emit('loginEvent'); });
      },
      checkAuth: function() {
        console.log('Attempt Check Auth');
        try {
          return gapi.auth.authorize({ client_id: clientId, scope: scopes, immediate: true, hd: domain }, handleCheckAuthResult);
        }
        catch(e) { return deferred.resolve(false);  }
      },
      signOut: function() {
        try {
          var auth2 = gapi.auth2.getAuthInstance();
          auth2.signOut().then(function() {
            console.log('Google user signed out');
            auth2.disconnect();
          });
        }
        catch(e) {}
      }
    };

    return serviceAPI;
  }
];

angular.module('ept').service('GoogleAuth', service);
