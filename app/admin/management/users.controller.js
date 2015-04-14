module.exports = ['$scope', 'users', function($scope, users) {
  this.parent = $scope.$parent;
  this.parent.tab = 'users';
  this.users = users;
}];
