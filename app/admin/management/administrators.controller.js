module.exports = ['$scope', 'users', function($scope, users) {
  this.parent = $scope.$parent;
  this.parent.tab = 'administrators';
  this.users = users;
  this.tableFilter = 0;
}];
