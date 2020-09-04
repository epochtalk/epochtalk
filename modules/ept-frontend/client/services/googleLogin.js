module.exports = ['$window', '$http', '$rootScope', '$q', function ($window, $http, $rootScope, $q) {
    var clientId = '241699585766-4hh76kcbdhq1bvrbo80a184pabrk03kr.apps.googleusercontent.com',
        apiKey = 'AIzaSyCnpiK9upqkeTndKeCOPaeTYJ7vfZu-kBs',
        scopes = 'https://www.googleapis.com/auth/userinfo.email',
        domain = 'dev.epochtalk.com:8080',
        deferred = $q.defer();

    this.login = function () {
        gapi.auth.authorize({ client_id: clientId, scope: scopes, immediate: false, hd: domain }, this.handleAuthResult);
        return deferred.promise;
    }

    $window.initGapi = function () {
        gapi.client.setApiKey(apiKey);
        gapi.auth.init(function () { });
        window.setTimeout(this.checkAuth, 1);
    };

    this.checkAuth = function() {
        gapi.auth.authorize({ client_id: clientId, scope: scopes, immediate: true, hd: domain }, this.handleAuthResult );
    };

    this.handleAuthResult = function(authResult) {
        if (authResult && !authResult.error) {
            var data = {};
            gapi.client.load('oauth2', 'v2', function () {
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
