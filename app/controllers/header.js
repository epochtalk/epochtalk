module.exports = ['$route', '$timeout', 'Auth', 'BreadcrumbSvc',
  function($route, $timeout, Auth, BreadcrumbSvc) {
    var ctrl = this;
    this.loggedIn = Auth.isAuthenticated;
    this.currentUser = Auth.currentUser;
    this.user = {};

    Auth.checkAuthentication();

    this.breadcrumbs = BreadcrumbSvc.crumbs;

    this.enterLogin = function(keyEvent) {
      if (keyEvent.which === 13) {
        ctrl.login();
      }
    };

    this.show = false;
    this.openLoginModal = function() {
      ctrl.show = true;
    };

    this.closeLoginModal = function() {
      ctrl.show = false;
    };

    this.login = function() {
      Auth.login(ctrl.user,
        function(data) {
          ctrl.closeLoginModal();
          ctrl.user.username = '';
          ctrl.user.password = '';
          $timeout(function() { $route.reload(); });
        }
      );
    };

    this.logout = function() {
      Auth.logout(function(data) {
        $timeout(function() { $route.reload(); });
      });
    };
  }
];
