var ctrl = ['$timeout', '$scope', 'pageData',
  function($timeout, $scope, pageData) {
    // page variables
    var ctrl = this;

    // index variables
    this.ads = pageData.ads;
    this.factoids = pageData.factoids;
    this.infoText = pageData.text.info;
    this.adsCss = [];

    // calculate if factoids matter
    this.factoidSize = this.factoids.length;
    this.adSize = this.ads.length;
    if (this.factoidSize) { this.adSize++; }

    // Render Ads
    this.renderAds = function() {
      ctrl.ads.forEach(function(ad, index) {
        // render css
        var node = document.getElementById(ad.id);
        if (!node && ad.display_css) {
          ctrl.adsCss.push(ad.id); // keep track of what we loaded
          node = document.createElement('style');
          node.setAttribute('id', ad.id);
          node.innerHTML = ad.display_css;
          document.body.appendChild(node);
        }
        // render html
        document.getElementById('ad-' + index).innerHTML = ad.display_html;
      });
    };
    $timeout(this.renderAds);

    $scope.$on('$destroy', function() {
      ctrl.adsCss.map(function(adId) {
        var node = document.getElementById(adId);
        node.parentElement.removeChild(node);
      });
    });

    // Render Factoids
    this.renderFactoids = function() {
      ctrl.factoids.forEach(function(factoid, index) {
        document.getElementById('factoid-' + index).innerHTML = factoid.text;
      });
    };
    $timeout(this.renderFactoids);
  }
];

module.exports = angular.module('ept.ads.info.ctrl', [])
.controller('AdInfoCtrl', ctrl)
.name;
