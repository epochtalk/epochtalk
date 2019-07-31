var service = ['User', 'Session', 'PreferencesSvc', 'BanSvc', '$rootScope', 'Alert',
  function(User, Session, PreferencesSvc, BanSvc, $rootScope, Alert) {
    // Service API
    var serviceAPI = {
      register: function(user) {
        return User.register(user).$promise
        .then(function(resource) {
          // Set user session if account is already confirmed (log the user in)
          if (!resource.confirm_token) {
            Session.setUser(resource);
            $rootScope.$emit('loginEvent');
          }
          return resource;
        })
        .catch(console.log);
      },

      login: function(user) {
        return User.login(user).$promise
        .then(function(resource) { Session.setUser(resource); })
        .then(function() { PreferencesSvc.pullPreferences(); })
        .then(function() { $rootScope.$emit('loginEvent'); })
        .catch(console.log);
      },

      logout: function() {
        return User.logout().$promise
        .then(function() { Session.clearUser(); })
        .then(function() { PreferencesSvc.clearPreferences(); })
        .finally(function() { $rootScope.$emit('logoffEvent'); })
        .catch(console.log);
      },

      authenticate: function() {
        if (Session.getToken()) {
          User.ping().$promise
          .then(function(user) {
            Session.setUser(user);
            PreferencesSvc.pullPreferences();
            BanSvc.update();
          })
          .catch(function(err) {
            Alert.warning('Session no longer valid, you have been logged out.');
            console.log(err);
          });
        }
        else { Session.clearUser(); }
      }
    };

    serviceAPI.authenticate();
    return serviceAPI;
  }
];

angular.module('ept').service('Auth', service);
