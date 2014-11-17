module.exports = ['$route', '$timeout', 'Auth', 'BreadcrumbSvc',
  function($route, $timeout, Auth, BreadcrumbSvc) {
    var ctrl = this;
    this.loggedIn = Auth.isAuthenticated;
    this.currentUser = Auth.getUsername;
    this.breadcrumbs = BreadcrumbSvc.crumbs;
    Auth.checkAuthentication();

    // Login Modal
    this.user = {}; // Login form Model
    this.loginError = {}; // Holds login errors
    this.loginModalVisible = false;  // Indicates if modal is currently in view
    this.showLogin = false; // Toggling show will open/close modal

    // Register Modal
    this.registerUser = {}; // Register form model
    this.registerError = {}; // Holds registration errors
    this.registerModalVisible = false; // Indicates if modal is currrently in view
    this.showRegister = false; // Toggling show will open/close modal

    // Register Success Modal
    this.showRegisterSuccess = false;

    // Recover Account Modal
    this.recover = {}; // Recover Account Model
    this.recoverError = {}; // Holds recover account errors
    this.recoverSubmitted = false; // Indicates if form successfully submitted
    this.recoverModalVisible = false; // Indicates if modal is currently in view
    this.showRecover = false; // Toggling show will open/close modal
    this.recoverDisabled = false; // Indicates if the 'Recover' button is disabled
    this.recoverBtnLabel = 'Recover'; // The label for the 'Recover' button

    // Login Modal Methods
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
        function() {
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
      Auth.logout(function() {
        $timeout(function() { $route.reload(); });
      });
    };


    // Registration Modal Methods
    this.openRegisterModal = function() {
      ctrl.showRegister = true;
      ctrl.registerModalVisible = true; // modal is in view
    };

    this.closeRegisterModal = function() {
      ctrl.showRegister = false;
    };

    this.register = function() {
      if (Auth.isAuthenticated()) {
        ctrl.registerError.status = true;
        ctrl.registerError.message = 'Cannot register new user while logged in.';
        return;
      }
      ctrl.registerError = {};
      Auth.register(this.registerUser,
        function() {
          ctrl.clearRegisterFields();
          ctrl.closeRegisterModal();
          $timeout(function() {
            ctrl.showRegisterSuccess = true;
          }, 500);
        },
        function(err) {
          ctrl.registerError.status = true;
          ctrl.registerError.message = err.data.message;
        }
      );
    };

    this.clearRegisterFields = function() {
      // Delay clearing fields to hide clear from users
      $timeout(function() {
        ctrl.registerModalVisible = false; // Modal is out of view
        ctrl.registerUser = {};
        ctrl.registerError = {};
      }, 500);
    };


    // Recover Account Modal Methods
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
      Auth.recoverAccount({ query: ctrl.recover.query },
      function() { // Success
        ctrl.recoverSubmitted = true;
        ctrl.recoverDisabled = false;
        ctrl.recoverBtnLabel = 'Recover';
      },
      function(err) { // Error
        ctrl.recoverError.status = true;
        ctrl.recoverError.message = err.data.message;
        ctrl.recoverDisabled = false;
        ctrl.recoverBtnLabel = 'Recover';
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
