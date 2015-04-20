module.exports = ['$state', '$stateParams', '$location', '$timeout', 'Auth', 'Session', 'User', 'BreadcrumbSvc',
  function($state, $stateParams, $location, $timeout, Auth, Session, User, BreadcrumbSvc) {
    var ctrl = this;
    this.currentUser = Session.user;
    this.loggedIn = Session.isAuthenticated;
    this.breadcrumbs = BreadcrumbSvc.crumbs;

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
    this.openLoginModal = function() {
      ctrl.showLogin = true;
      ctrl.loginModalVisible = true; // modal is in view
    };

    this.closeLoginModal = function() { ctrl.showLogin = false; };

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
      if (ctrl.user.username.length === 0 || ctrl.user.password.length === 0) { return; }
      ctrl.loginError = {};
      Auth.login(ctrl.user,
        function() {
          ctrl.closeLoginModal();
          ctrl.clearLoginFields();
          $timeout(function() {
            // hack to get drop down to work in nested view pages
            // the proper fix would be to put the dropdown in a directive
            $(document).foundation('topbar', 'reflow');
            $state.go($state.current, $stateParams, { reload: true });
          }, 10);
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
        $timeout(function() {
          // hack to get drop down to work in nested view pages
          // the proper fix would be to put the dropdown in a directive
          $state.go($state.current, $stateParams, { reload: true });
        });
      });
    };

    // Registration Modal Methods
    this.openRegisterModal = function() {
      ctrl.showRegister = true;
      ctrl.registerModalVisible = true; // modal is in view
    };

    this.closeRegisterModal = function() { ctrl.showRegister = false; };

    this.register = function() {
      if (Session.isAuthenticated()) {
        ctrl.registerError.status = true;
        ctrl.registerError.message = 'Cannot register new user while logged in.';
        return;
      }
      ctrl.registerError = {};
      Auth.register(this.registerUser,
        function() {
          ctrl.clearRegisterFields();
          ctrl.closeRegisterModal();
          $timeout(function() { ctrl.showRegisterSuccess = true; }, 500);
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
      User.recoverAccount({ query: ctrl.recover.query },
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
        $timeout(function() { ctrl.openRecoverModal(); }, 200);
      }
      else {
        ctrl.closeRecoverModal();
        $timeout(function() { ctrl.openLoginModal(); }, 200);
      }
    };

  }
];
