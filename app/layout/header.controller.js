var ctrl = ['$scope', '$location', '$timeout', '$state', '$stateParams', 'Auth', 'Session', 'User', 'BreadcrumbSvc', 'Alert', 'ThemeSVC',
  function($scope, $location, $timeout, $state, $stateParams, Auth, Session, User, BreadcrumbSvc, Alert, ThemeSVC) {
    var ctrl = this;
    this.currentUser = Session.user;
    this.hasPermission = Session.hasPermission;
    this.previewActive = ThemeSVC.previewActive();
    this.loggedIn = Session.isAuthenticated;
    this.breadcrumbs = BreadcrumbSvc.crumbs;
    this.loginOrRecover = true;

    // Update preview mode on change
    $scope.$watch(function() { return ThemeSVC.previewActive(); }, function(val) {
      ctrl.previewActive = val;
    });

    this.cancelPreview = function() {
      ThemeSVC.toggleCSS(false);
      $state.go('admin-settings.theme', { preview: undefined }, { reload: true });
    };

    this.savePreview = function() {
      ThemeSVC.saveTheme();
    };

    this.continueEditing = function() {
      $state.go('admin-settings.theme', { preview: true }, { reload: false });
    };

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
      $timeout(function() { ctrl.user = {}; }, 500);
    };

    this.login = function() {
      if (ctrl.user.username.length === 0 || ctrl.user.password.length === 0) { return; }

      Auth.login(ctrl.user)
      .then(function() {
        ctrl.showLogin = false;
        ctrl.clearLoginFields();
        if ($state.current.name === 'login') { // handle login via login page
          $state.go($state.next, $state.nextParams, { reload: true });
          $state.next = undefined;
          $state.nextParams = undefined; //clear out next state info after redirect
        }
        else { $state.go($state.current, $stateParams, { reload: true }); }
      })
      .catch(function(err) {
        if (err.data && err.data.message) { Alert.error(err.data.message); }
        else { Alert.error('Login Failed'); }
      });
    };

    this.logout = function() {
      Auth.logout()
      .then(function() {
        $state.go($state.current, $stateParams, { reload: true });
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
        // manual clear because angular validation bug
        ctrl.registerUser.email = '';
        ctrl.registerUser.username = '';
      }, 500);
    };

    this.register = function() {
      if (Session.isAuthenticated()) {
        Alert.error('Cannot register new user while logged in.');
        return;
      }

      Auth.register(ctrl.registerUser)
      .then(function(registeredUser) {
        ctrl.showRegister = false;
        ctrl.clearRegisterFields();
        if (registeredUser.confirm_token) {
          $timeout(function() { ctrl.showRegisterSuccess = true; }, 500);
        }
        else {
          $timeout(function() { $state.go($state.current, $stateParams, { reload: true }); }, 500);
        }
      })
      .catch(function(err) {
        if (err.data && err.data.message) { Alert.error(err.data.message); }
        else { Alert.error('Registration Error'); }
      });
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
      }, 500);
    };

    this.recover = function() {
      if (ctrl.recoverQuery.length === 0) { return; }

      ctrl.recoverSubmitted = true;
      ctrl.recoverBtnLabel = 'Loading...';

      User.recoverAccount({ query: ctrl.recoverQuery }).$promise
      .then(function() { ctrl.recoverBtnLabel = 'Account Reset'; })
      .catch(function(err) {
        ctrl.recoverSubmitted = false;
        ctrl.recoverBtnLabel = 'Reset';
        Alert.error(err.data.message);
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

module.exports = angular.module('ept.header', [])
.controller('HeaderCtrl', ctrl)
.name;
