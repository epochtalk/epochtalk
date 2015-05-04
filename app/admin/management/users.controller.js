module.exports = ['$rootScope', '$scope', '$location', '$timeout', '$anchorScroll', 'AdminUsers', 'users', 'usersCount', 'page', 'limit', 'field', 'desc', function($rootScope, $scope, $location, $timeout, $anchorScroll, AdminUsers, users, usersCount, page, limit, field, desc) {
  var ctrl = this;
  this.parent = $scope.$parent;
  this.parent.tab = 'users';
  this.usersCount =  Math.ceil(usersCount / limit);
  this.users = users;
  this.page = page;
  this.limit = limit;
  this.field = field;
  this.desc = desc;

  $timeout($anchorScroll);

  this.offLCS = $rootScope.$on('$locationChangeSuccess', function(){
    var params = $location.search();
    var page = Number(params.page) || 1;
    var limit = Number(params.limit) || 10;
    var field = params.field;
    var desc = params.desc;
    var pageChanged = false;
    var limitChanged = false;
    var fieldChanged = false;
    var descChanged = false;

    if (page && page !== ctrl.page) {
      pageChanged = true;
      ctrl.parent.page = page;
      ctrl.page = page;
    }
    if (limit && limit !== ctrl.limit) {
      limitChanged = true;
      ctrl.limit = limit;
    }
    if (field && field !== ctrl.field) {
      fieldChanged = true;
      ctrl.field = field;
    }
    if (desc && desc !== ctrl.desc) {
      descChanged = true;
      ctrl.desc = desc;
    }

    if(pageChanged || limitChanged || fieldChanged || descChanged) { ctrl.pullPage(); }
  });
  $scope.$on('$destroy', function() { ctrl.offLCS(); });

  this.pullPage = function() {
    var query = {
      page: ctrl.page,
      limit: ctrl.limit
    };

    if (ctrl.desc) { query.desc = ctrl.desc; }
    if (ctrl.field) { query.field = ctrl.field; }

    // update board's thread page count
    AdminUsers.count().$promise
    .then(function(updatedCount) {
      ctrl.usersCount = Math.ceil(updatedCount.count / limit);
    });

    // replace current users with new users
    AdminUsers.page(query).$promise
    .then(function(users) {
      ctrl.users = users;
      $timeout($anchorScroll);
    });
  };
}];
