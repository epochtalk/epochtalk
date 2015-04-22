module.exports = ['$state', '$stateParams', '$location', '$timeout', 'Auth', 'Session', 'User', 'BreadcrumbSvc',
  function($state, $stateParams, $location, $timeout, Auth, Session, User, BreadcrumbSvc) {
    var ctrl = this;
    this.currentUser = Session.user;
    this.loggedIn = Session.isAuthenticated;
    this.breadcrumbs = BreadcrumbSvc.crumbs;
    this.errors = {};

    this.checkAdminRoute = function(route) {
      var pathArr = $location.path().split('/');
      pathArr.shift();
      if (pathArr.length < 2) { return false; }
      return pathArr[0].toLowerCase() === 'admin' && pathArr[1].toLowerCase() === route;
    };

    // Login/LogOut
    this.user = {};
    this.showLogin = false;
    this.clearLoginFields = function() {
      $timeout(function() {
        ctrl.user = {};
        delete ctrl.errors.login;
      }, 500);
    };

    this.login = function() {
      if (ctrl.user.username.length === 0 || ctrl.user.password.length === 0) { return; }
      delete ctrl.errors.login;

      Auth.login(ctrl.user,
        function() {
          ctrl.showLogin = false;
          ctrl.clearLoginFields();
          $timeout(function() {
            // hack to get drop down to work in nested view pages
            // the proper fix would be to put the dropdown in a directive
            $(document).foundation('topbar', 'reflow');
            $state.go($state.current, $stateParams, { reload: true });
          }, 10);
        },
        function(err) {
          ctrl.errors.login = {};
          if (err.data && err.data.message) {
            ctrl.errors.login.message = err.data.message;
          }
          else { ctrl.errors.login.message = 'Login Failed'; }
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

    // Registration
    this.registerUser = {}; // Register form model
    this.showRegister = false; // Toggling show will open/close modal
    this.showRegisterSuccess = false;
    this.clearRegisterFields = function() {
      // Delay clearing fields to hide clear from users
      $timeout(function() {
        ctrl.registerUser = {};
        ctrl.registerUser.email = ''; // manual clear because angular bug
        ctrl.registerUser.username = ''; // manual clear because angular bug
        delete ctrl.errors.register;
      }, 500);
    };

    this.register = function() {
      if (Session.isAuthenticated()) {
        ctrl.errors.register = {};
        ctrl.errors.register.message = 'Cannot register new user while logged in.';
        return;
      }
      delete ctrl.errors.register;

      Auth.register(ctrl.registerUser,
        function() {
          ctrl.showRegister = false;
          ctrl.clearRegisterFields();
          $timeout(function() { ctrl.showRegisterSuccess = true; }, 500);
        },
        function(err) {
          ctrl.errors.register = {};
          ctrl.errors.register.message = err.data.message;
        }
      );
    };

    // Recover Account
    this.recoverQuery = '';
    this.showRecover = false;
    this.recoverSubmitted = false;
    this.recoverBtnLabel = 'Reset';
    this.clearRecoverFields = function() {
      $timeout(function() {
        ctrl.recoverSubmitted = false;
        ctrl.recoverBtnLabel = 'Reset';
        ctrl.recoverQuery = '';
        delete ctrl.errors.recover;
      }, 500);
    };

    this.recover = function() {
      if (ctrl.recoverQuery.length === 0) { return; }

      delete ctrl.errors.recover;
      ctrl.recoverSubmitted = true;
      ctrl.recoverBtnLabel = 'Loading...';

      User.recoverAccount({ query: ctrl.recoverQuery }).$promise
      .then(function() { ctrl.recoverBtnLabel = 'Account Reset'; })
      .catch(function(err) {
        ctrl.recoverSubmitted = false;
        ctrl.recoverBtnLabel = 'Reset';
        ctrl.errors.recover = {};
        ctrl.errors.recover.message = err.data.message;
      });
    };

    this.swapModals = function() {
      if (ctrl.showLogin) {
        ctrl.showLogin = false;
        $timeout(function() { ctrl.showRecover = true; }, 200);
      }
      else {
        ctrl.showRecover = false;
        $timeout(function() { ctrl.showLogin = true; }, 200);
      }
    };

  }
];
