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

    this.show = false; //  toggling show will open/close modal
    this.modalVisible = false;  // Indicates if the modal is currently still in view
    this.openLoginModal = function() {
      ctrl.show = true;
      ctrl.modalVisible = true; // modal is in view
    };

    this.closeLoginModal = function() {
      ctrl.show = false;
    };

    this.clearLoginFields = function() {
      // Delay clearing fields to hide clear from users
      $timeout(function() {
        ctrl.modalVisible = false; // Modal is out of view
        ctrl.user.username = '';
        ctrl.user.password = '';
        ctrl.user.rememberMe = false;
      }, 500);
    };

    this.login = function() {
      Auth.login(ctrl.user,
        function(data) {
          ctrl.closeLoginModal();
          ctrl.clearLoginFields();
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
