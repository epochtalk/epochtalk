var directive = ['$timeout', '$q', '$http', function ($timeout, $q, $http) {
    return {
        restrict: 'AE',
        require: 'ngModel',
        link: function ($scope, $elm, $attrs, $model) {
            var $options = angular.copy($scope.$eval($attrs.usernameExists));

            $model.$asyncValidators.usernameExists = function (value) {
                if (value === '' || !$model.$dirty || (typeof $options !== 'undefined' && value === $options.initial)) {
                    return $q.resolve();
                }

                return $http({
                    method: 'GET',
                    url: '/api/search/users?field=username&limit=1&search=' + value
                }).then(function (response) {
                    if (response.status !== 200) {
                        return $q.reject();
                    }

                    var data = response.data;
                    if (typeof data.users[0] !== 'undefined' && data.users[0].username === value) {
                        return true;
                    }

                    return $q.reject();
                });
            };
        }
    }
}];

module.exports = angular.module('ept.directives.username-exists', [])
.directive('usernameExists', directive);
