var directive = ['Ads', function(Ads) {
  return {
    restrict: 'E',
    scope: true,
    bindToController: { page: '=' },
    template: '<div id="eptAd"></div>',
    controllerAs: 'vm',
    controller: ['$scope', function($scope) {
      var ctrl = this;
      this.adCss = [];

      $scope.$watch(
        function() { return ctrl.page; },
        function(newValue) { if (newValue) { getAd(); } }
      );

      function getAd() {
        Ads.view().$promise
        .then(function(data) {
          var html = '';

          // cleanup
          ctrl.adCss.map(function(adId) {
            var node = document.getElementById(adId);
            node.parentElement.removeChild(node);
          });
          ctrl.adCss = [];

          // append text/html
          if (data.type === 'factoid') {
            html = '<div class="ad-text">' + data.data.text + '</div>';
          }
          else if (data.html) { html = data.html; }
          else { return; }

          // bind any css
          if (data.css) {
            ctrl.adCss.push(data.id);
            var node = document.createElement('style');
            node.setAttribute('id', data.id);
            node.innerHTML = data.css;
            document.body.appendChild(node);
          }

          // add disclaimer
          html += '<div class="ad-disclaimer">' + data.disclaimer + '</div>';

          // push to screen
          document.getElementById('eptAd').innerHTML = html;
        });
      }

      // clean up on page exit
      $scope.$on('$destroy', function() {
        ctrl.adCss.map(function(adId) {
          var node = document.getElementById(adId);
          node.parentElement.removeChild(node);
        });
        ctrl.adCss = [];
      });
    }]
  };
}];

angular.module('ept').directive('adViewer', directive);
