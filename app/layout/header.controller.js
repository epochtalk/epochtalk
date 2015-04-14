module.exports = ['$state', '$location', '$timeout', 'Auth', 'BreadcrumbSvc',
  function($state, $location, $timeout, Auth, BreadcrumbSvc) {
    var ctrl = this;
    this.loggedIn = Auth.isAuthenticated;
    this.currentUserIsAdmin = false;
    this.currentUserIsMod = false;
    this.currentUsername = Auth.getUsername;
    this.breadcrumbs = BreadcrumbSvc.crumbs;
    Auth.checkAuthentication();

    // Used to determine if user is an admin or mod for displaying
    // extra menu items for mod/admin panels
    var checkUserRoles = function() {
      ctrl.currentUserIsAdmin = false;
      ctrl.currentUserIsMod = false;
      Auth.getRoles()
      .then(function(roles) {
        roles.forEach(function(role) {
          // This may change in the future, for now this method looks if the user
          // is and admin or mod by doing a string comparison to the users role names
          if (role.name === 'Moderator' || role.name === 'Global Moderator') {
            ctrl.currentUserIsMod = true;
          }
          else if (role.name === 'Administrator') {
            ctrl.currentUserIsAdmin = true;
          }
        });
      });
    };

    checkUserRoles(); // Check the authenticated users roles

    this.checkAdminRoute = function(route) {
      var pathArr = $location.path().split('/');
      pathArr.shift();
      if (pathArr.length < 2) { return false; }
      return pathArr[0].toLowerCase() === 'admin' && pathArr[1].toLowerCase() === route;
    };

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
          checkUserRoles();
          $timeout(function() { $state.go('.', $location.search(), { reload: true }); });
        },
        function(err) {
          ctrl.loginError.status = true;
          if (err && err.data && err.data.message) {
            ctrl.loginError.message = err.data.message;
          }
          else { ctrl.loginError.message = 'Unable to connect to server'; }
        }
      );
    };

    this.logout = function() {
      Auth.logout(function() {
        ctrl.currentUserIsMod = false;
        ctrl.currentUserIsAdmin = false;
        $timeout(function() { $state.go('.', $location.search(), { reload: true }); });
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
          checkUserRoles();
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
