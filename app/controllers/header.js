module.exports = ['$route', '$timeout', 'Auth', 'BreadcrumbSvc', 'User',
  function($route, $timeout, Auth, BreadcrumbSvc, User) {
    var ctrl = this;
    this.loggedIn = Auth.isAuthenticated;
    this.currentUser = Auth.getUsername;

    this.user = {}; // Login Model
    this.recover = {}; // Recover Account Model

    this.loginError = {}; // Holds login errors
    this.recoverError = {}; // Holds recover account erros

    this.recoverSubmitted = false; // Indicates if form successfully submitted
    this.recoverModalVisible = false; // Indicates if modal is currently in view
    this.showRecover = false; // toggling show will open/close modal

    this.recoverDisabled = false; // Indicates if the 'Recover' button is disabled
    this.recoverBtnLabel = 'Recover'; // The label for the 'Recover' button

    this.loginModalVisible = false;  // Indicates if modal is currently still in view
    this.showLogin = false; //  toggling show will open/close modal


    Auth.checkAuthentication();

    this.breadcrumbs = BreadcrumbSvc.crumbs;

    this.enterRecover = function(keyEvent) {
      if (keyEvent.which === 13 && ctrl.recover.query.length) {
        ctrl.recover();
      }
    };

    this.openRecoverModal = function() {
      ctrl.showRecover = true;
      ctrl.recoverModalVisible = true;
    };

    this.closeRecoverModal = function() {
      ctrl.showRecover = false;
    };

    this.clearRecoverFields = function() {
      // Delay clearing fields to hide clear from users
      $timeout(function() {
        ctrl.recoverModalVisible = false; // Modal is out of view
        ctrl.recoverSubmitted = false;
        ctrl.recover.query = '';
        ctrl.recoverError = {};
      }, 500);
    };

    this.recover = function() {
      ctrl.recoverError = {};
      ctrl.recoverDisabled = true;
      ctrl.recoverBtnLabel = 'Loading...';
      User.recoverAccount({ query: ctrl.recover.query }).$promise
      .then(function() { // Success
        ctrl.recoverSubmitted = true;
        ctrl.recoverDisabled = false;
        ctrl.recoverBtnLabel = 'Recover';
      })
      .catch(function(err) { // Error
        ctrl.recoverError.status = true;
        ctrl.recoverError.message = err.data.message;
        ctrl.recoverDisabled = false;
        ctrl.recoverBtnLabel = 'Recover';
      });
    };

    this.enterLogin = function(keyEvent) {
      if (keyEvent.which === 13 && ctrl.user.username.length && ctrl.user.password.length) {
        ctrl.login();
      }
    };

    this.openLoginModal = function() {
      ctrl.showLogin = true;
      ctrl.loginModalVisible = true; // modal is in view
    };

    this.closeLoginModal = function() {
      ctrl.showLogin = false;
    };

    this.clearLoginFields = function() {
      // Delay clearing fields to hide clear from users
      $timeout(function() {
        ctrl.loginModalVisible = false; // Modal is out of view
        ctrl.user.username = '';
        ctrl.user.password = '';
        ctrl.user.rememberMe = false;
        ctrl.loginError = {};
      }, 500);
    };

    this.login = function() {
      ctrl.loginError = {};
      Auth.login(ctrl.user,
        function(data) {
          ctrl.closeLoginModal();
          ctrl.clearLoginFields();
          $timeout(function() { $route.reload(); });
        },
        function(err) {
          ctrl.loginError.status = true;
          ctrl.loginError.message = err.data.message;
        }
      );
    };

    this.logout = function() {
      Auth.logout(function(data) {
        $timeout(function() { $route.reload(); });
      });
    };

    this.swapModals = function() {
      if (ctrl.showLogin) {
        ctrl.closeLoginModal();
        $timeout(function() {
          ctrl.openRecoverModal();
        }, 200);
      }
      else {
        ctrl.closeRecoverModal();
        $timeout(function() {
          ctrl.openLoginModal();
        }, 200);
      }
    };

  }
];
