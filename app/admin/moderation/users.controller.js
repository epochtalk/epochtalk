module.exports = ['$scope', '$location', 'userReports', 'user', function($scope, $location, userReports, user) {
  var ctrl = this;
  this.parent = $scope.$parent;
  this.parent.tab = 'users';
  this.userReports = userReports;
  this.tableFilter = 0;
  this.selectedUsername = user.username;

  this.selectUser = function(username) {
    $location.search('username', username);
    ctrl.selectedUsername = username;
  };

}];
