module.exports = ['User', 'Session', 'PreferencesSvc', 'BanSvc', '$rootScope',
  function(User, Session, PreferencesSvc, BanSvc, $rootScope) {
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
        });
      },

      login: function(user) {
        return User.login(user).$promise
        .then(function(resource) { Session.setUser(resource); })
        .then(function() { PreferencesSvc.pullPreferences(); })
        .then(function() { $rootScope.$emit('loginEvent'); });
      },

      logout: function() {
        return User.logout().$promise
        .then(function() { Session.clearUser(); })
        .then(function() { PreferencesSvc.clearPreferences(); })
        .finally(function() { $rootScope.$emit('logoffEvent'); });
      },

      authenticate: function() {
        if (Session.getToken()) {
          User.ping().$promise
          .then(function(user) { Session.setUser(user); })
          .then(function() { PreferencesSvc.pullPreferences(); })
          .then(function() { BanSvc.update(); });
        }
        else { Session.clearUser(); }
      }
    };

    serviceAPI.authenticate();
    return serviceAPI;
  }
];
