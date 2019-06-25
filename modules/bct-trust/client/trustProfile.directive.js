var html = '<div><span>Trust:&nbsp;&nbsp;<strong><span class="trust-score" ng-class="vmTrust.getStyle(vmTrust.stats.score)"><span data-balloon="Trust Score">{{vmTrust.stats.score}}</span> : <span data-balloon="Negative Feedback" ng-class="{\'neg\' : vmTrust.stats.neg !== 0 }">-{{vmTrust.stats.neg}}</span> / <span data-balloon="Positive Feedback">+{{vmTrust.stats.pos}}</span></span></strong></span></div>';
html += '<div ng-if="vmTrust.stats.score < 0"><span class="trust-score" ng-class="vmTrust.getStyle(vmTrust.stats.score)">Warning: Trade with extreme caution!</span></div>';
html += '<div><span><a ui-sref="trust({ username: vmTrust.username })">View Trust Feedback</a></span></div>';

var directive = ['UserTrust', function(UserTrust) {
  return {
    restrict: 'E',
    scope: true,
    bindToController: { username: '=' },
    template: html,
    controllerAs: 'vmTrust',
    controller: ['$scope', function($scope) {
      var ctrl = this;
      this.stats = null;
      // Watch for username change
      $scope.$watch(function() { return ctrl.username; }, function(val) {
        if (val) {
          UserTrust.getTrustStats({ username: val }).$promise
          .then(function(stats) {
            ctrl.stats = stats;
          });
        }
      });

      this.getStyle = function(score) {
        if (score === '???') { return 'unknown'; }
        else {
          if (score < 0) { return 'low'; }
          if (score > 4) { return 'mid'; }
          if (score > 14) { return 'high'; }
        }
      };

    }]
  };
}];


angular.module('ept').directive('trustProfile', directive);
