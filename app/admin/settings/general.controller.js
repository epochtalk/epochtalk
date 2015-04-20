module.exports = ['$scope', function($scope) {
  this.parent = $scope.$parent;
  this.parent.tab = 'general';
  this.localImageServer = true;
}];
