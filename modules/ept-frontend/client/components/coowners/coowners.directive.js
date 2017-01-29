var directive = ['Session', function (Session) {
    return {
        restrict: 'E',
        scope: {coOwners: '=', valid: '=' },
        template: require('./coowners.html'),
        link: function ($scope) {
            $scope.user = Session.user;
            $scope.coOwners = {};
            $scope.coOwners.users = $scope.coOwners.users || [''];
            $scope.addCoOwner = function () {
                $scope.coOwners.users.push('');
            };
            $scope.removeCoOwner = function (index) {
                $scope.coOwners.users.splice(index, 1);
            };
            $scope.$watch('coOwners', function() {
                $scope.valid = $scope.coOwnersForm.$valid;
            }, true);
        }
    };
}];

module.exports = angular.module('ept.directives.co-owners', [])
.directive('coOwners', directive);
