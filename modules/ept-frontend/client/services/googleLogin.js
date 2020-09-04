module.exports = ['User', '$window', '$http', '$rootScope', '$q', function (User, $window, $http, $rootScope, $q) {
    var clientId = '241699585766-4hh76kcbdhq1bvrbo80a184pabrk03kr.apps.googleusercontent.com',
        apiKey = 'AIzaSyCnpiK9upqkeTndKeCOPaeTYJ7vfZu-kBs',
        scopes = 'https://www.googleapis.com/auth/userinfo.email',
        domain = 'dev.epochtalk.com:8080',
        discoveryDocs = 'https://script.googleapis.com/$discovery/rest?version=v1',
        deferred = $q.defer();

    this.login = function () {
        gapi.auth.authorize({ client_id: clientId, scope: scopes, immediate: false, hd: domain }, this.handleAuthResult);
        return deferred.promise;
    }

    $window.initGapi = function () {
        gapi.load('client:auth2', this.initClient);
    };

    this.initClient = function() {
       gapi.client.init({
           apiKey: apiKey,
           discoveryDocs: discoveryDocs,
           clientId: clientId,
           scope: scopes
       })
       .then(this.checkAuth);
    };

    this.checkAuth = function() {
        gapi.auth.authorize({ client_id: clientId, scope: scopes, immediate: true, hd: domain }, this.handleAuthResult );
    };

    this.handleAuthResult = function(authResult) {
        console.log('Auth Result', authResult);
        User.authWithGoogle({ access_token: authResult.access_token }).$promise
        .then(function() {

        });
        if (authResult && !authResult.error) {
            var data = {};
            gapi.client.load('oauth2', 'v2', function (test) {
                console.log('API', test);
                var request = gapi.client.oauth2.userinfo.get();
                request.execute(function (resp) {
                    $rootScope.$apply(function () {
                        console.log(resp);
                        data.name = resp.name;
                        data.email = resp.email;
                        data.avatar = resp.picture;
                        data.google_id = resp.id;
                    });
                });
            });
            deferred.resolve(data);
        } else {
            deferred.reject('error');
        }
    };

    this.handleAuthClick = function (event) {
        gapi.auth.authorize({ client_id: clientId, scope: scopes, immediate: false, hd: domain }, this.handleAuthResult );
        return false;
    };

}];
