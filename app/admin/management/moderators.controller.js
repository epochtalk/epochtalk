module.exports = ['$scope', 'users', function($scope, users) {
  this.parent = $scope.$parent;
  this.parent.tab = 'moderators';
  this.users = users;
  this.tableFilter = 0;
}];
