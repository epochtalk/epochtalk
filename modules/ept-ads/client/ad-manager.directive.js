var directive = ['Ads', 'Alert', '$timeout', function(Ads, Alert, $timeout) {
  return {
    restrict: 'E',
    scope: true,
    bindToController: { },
    template: require('./ad-manager.html'),
    controllerAs: 'vm',
    controller: ['$scope', function($scope) {
      var ctrl = this;
      this.ads = [];
      this.factoids = [];
      this.round = 'current';
      this.tab = 'rounds';
      this.currentRound = 'current';
      this.nextRound = false;
      this.previousRound = false;
      this.text = {};
      this.showDirective = true;

      // initial load
      Ads.viewRound({roundNumber: ctrl.currentRound, type: 'both'}).$promise
      .then(function(data) {
        ctrl.ads = data.ads;
        ctrl.factoids = data.factoids;
        ctrl.round = data.rounds.viewing;
        ctrl.currentRound =  data.rounds.current;
        ctrl.nextRound = data.rounds.next;
        ctrl.previousRound = data.rounds.previous;
        ctrl.text = data.text;
      })
      .then(function() { $timeout(ctrl.renderAds); })
      .then(function() { $timeout(ctrl.renderFactoids); })
      .catch(function(err) {
        if (err.status === 403) { ctrl.showDirective = false; }
        else { Alert.error(err.data.message); }
      });

      // Render Ads
      this.adsCss = [];
      this.trashAds = function() {
        ctrl.adsCss.map(function(adId) {
          var node = document.getElementById(adId);
          node.parentElement.removeChild(node);
        });
        ctrl.adsCss = [];
      };
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

      $scope.$on('$destroy', function() { ctrl.trashAds(); });

      // Render Factoids
      this.renderFactoids = function() {
        ctrl.factoids.forEach(function(factoid, index) {
          document.getElementById('factoid-' + index).innerHTML = factoid.text;
        });
      };

      // ==== Rounds ====

      // create rounds
      this.showCreateRound = false;
      this.createRound = function() {
        return Ads.createRound().$promise
        .then(function(data) { ctrl.round = data.round; })
        .then(function() { ctrl.pullRound(ctrl.round); })
        .catch(function(err) { Alert.error(err.data.message); })
        .then(function() { ctrl.showCreateRound = false; });
      };

      // pull round
      this.pullRound = function(round) {
        return Ads.viewRound({roundNumber:round, type: 'both'}).$promise
        .then(function(data) {
          ctrl.ads = data.ads;
          ctrl.factoids = data.factoids;
          ctrl.round = data.rounds.viewing;
          ctrl.currentRound = data.rounds.current;
          ctrl.nextRound = data.rounds.next;
          ctrl.previousRound = data.rounds.previous;
          ctrl.text = data.text;
        })
        .then(function() { $timeout(ctrl.trashAds); })
        .then(function() { $timeout(ctrl.renderAds); })
        .then(function() { $timeout(ctrl.renderFactoids); })
        .catch(function(err) { Alert.error(err.data.message); });
      };

      // rotate round
      this.showRotateRound = false;
      this.rotateRound = function() {
        var round = ctrl.round;
        return Ads.rotateRound({round:round}).$promise
        .then(function() { ctrl.currentRound = ctrl.round; })
        .then(function() { Alert.success('Ads from this round are now in circulation'); })
        .catch(function(err) { Alert.error(err.data.message); })
        .then(function() { ctrl.showRotateRound = false; });
      };

      // ==== Ads =====
      this.showWriteAd = false;
      this.showDeleteAd = false;
      this.tempAd = { html:'', css:''};

      // create ad
      this.openCreateAd = function() {
        ctrl.showWriteAd = true;
        ctrl.tempAd = {round: ctrl.round, html:'', css:''};
      };

      // Edit Ad
      this.openEditAd = function(ad) {
        ctrl.showWriteAd = true;
        ctrl.tempAd = {id: ad.id, round: ad.round, html:ad.html, css:ad.css};
      };

      // Delete Ad
      this.openDeleteAd = function(ad) {
        ctrl.showDeleteAd = true;
        ctrl.tempAd = {id: ad.id};
      };

      // Ad validation
      this.adValidation = function() {
        var disabled = false;
        if (!ctrl.tempAd || !ctrl.tempAd.html || !ctrl.tmpAd.html.length) { disabled = true; }
        return disabled;
      };

      // Save Ad
      this.saveAd = function() {
        var promise, adId = ctrl.tempAd.id;
        // check if create or edit
        if (adId) { promise = Ads.edit({adId:adId}, ctrl.tempAd).$promise; }
        else { promise = Ads.create(ctrl.tempAd).$promise; }

        return promise.then(function(data) {
          if (adId) {
            var editAd = ctrl.ads.filter(function(ad) { return ad.id === data.id; })[0];
            editAd.html = data.html;
            editAd.css = data.css;
          }
          else { ctrl.ads.push(data); }
        })
        .then(function() { ctrl.pullRound(ctrl.round); })
        .catch(function(err) { Alert.error(err.data.message); })
        .then(function() { ctrl.showWriteAd = false; });
      };

      // Remove Ad
      this.deleteAd = function() {
        return Ads.remove({adId:ctrl.tempAd.id}).$promise
        .then(function() {
          var adIndex = 0;
          ctrl.ads.map(function(ad, index) {
            if (ad.id === ctrl.tempAd.id) { adIndex = index; }
          });
          ctrl.ads.splice(adIndex, 1);
        })
        .then(function() { $timeout(ctrl.renderAds); })
        .catch(function(err) { Alert.error(err.data.message); })
        .then(function() { ctrl.showDeleteAd = false; });
      };

      // Duplicate Ads
      this.duplicateAd = function(adId) {
        return Ads.duplicate({adId: adId}).$promise
        .then(function() { return ctrl.pullRound(ctrl.round); });
      };

      // ==== Factoids =====
      this.showWriteFactoid = false;
      this.showDeleteFactoid = false;
      this.showEnableAllFactoids = false;
      this.showDisableAllFactoids = false;
      this.tempFactoid = { text: '' };

      // Create Factoid
      this.openCreateFactoid = function() {
        this.showWriteFactoid = true;
        this.tempFactoid = { text: '' };
      };

      // Edit Factoid
      this.openEditFactoid = function(factoid) {
        this.showWriteFactoid = true;
        this.tempFactoid = { id:factoid.id, text:factoid.text };
      };

      // Delete Factoid
      this.openDeleteFactoid = function(factoid) {
        this.showDeleteFactoid = true;
        this.tempFactoid = { id:factoid.id };
      };

      // Factoid Validation
      this.factoidValidation = function() {
        var disabled = false;
        if (ctrl.tempFactoid.text.length === 0) { disabled = true; }
        return disabled;
      };

      // Save Factoid
      this.saveFactoid = function() {
        var promise, factoidId = ctrl.tempFactoid.id;
        // check if create or edit
        if (factoidId) { promise = Ads.editFactoid({factoidId:factoidId}, ctrl.tempFactoid).$promise; }
        else { promise = Ads.createFactoid(ctrl.tempFactoid).$promise; }

        return promise.then(function(data) {
          if (factoidId) {
            var editFactoid = ctrl.factoids.filter(function(fact) {
              return fact.id === data.id;
            })[0];
            editFactoid.text = data.text;
          }
          else { ctrl.factoids.push(data); }
        })
        .then(function() { $timeout(ctrl.renderFactoids); })
        .catch(function(err) { Alert.error(err.data.message); })
        .then(function() { ctrl.showWriteFactoid = false; });
      };

      // Remove Factoid
      this.deleteFactoid = function() {
        return Ads.removeFactoid({factoidId:ctrl.tempFactoid.id}).$promise
        .then(function() {
          var factIndex = 0;
          ctrl.factoids.map(function(fact, index) {
            if (fact.id === ctrl.tempFactoid.id) { factIndex = index; }
          });
          ctrl.factoids.splice(factIndex, 1);
        })
        .then(function() { $timeout(ctrl.renderFactoids); })
        .catch(function(err) { Alert.error(err.data.message); })
        .then(function() { ctrl.showDeleteFactoid = false; });
      };

      // Enable Factoid
      this.enableFactoid = function(factoidId) {
        return Ads.enableFactoid({factoidId:factoidId}).$promise
        .then(function() {
          ctrl.factoids.map(function(fact) {
            if (fact.id === factoidId) { $timeout(function() {fact.enabled = true;}); }
          });
        })
        .catch(function(err) { Alert.error(err.data.message); });
      };

      // Disable Factoid
      this.disableFactoid = function(factoidId) {
        return Ads.disableFactoid({factoidId:factoidId}).$promise
        .then(function() {
          ctrl.factoids.map(function(fact) {
            if (fact.id === factoidId) { $timeout(function() { fact.enabled = false;}); }
          });
        })
        .catch(function(err) { Alert.error(err.data.message); });
      };

      // Enable All Factoids
      this.enableAllFactoids = function() {
        return Ads.enableFactoid({factoidId:'all'}).$promise
        .then(function() { ctrl.factoids.map(function(fact) { fact.enabled = true; }); })
        .catch(function(err) { Alert.error(err.data.message); })
        .then(function() { ctrl.showEnableAllFactoids = false; });
      };

      // Disable All Factoids
      this.disableAllFactoids = function() {
        return Ads.disableFactoid({factoidId:'all'}).$promise
        .then(function() { ctrl.factoids.map(function(fact) { fact.enabled = false; }); })
        .catch(function(err) { Alert.error(err.data.message); })
        .then(function() { ctrl.showDisableAllFactoids = false; });
      };

      // Save Text
      this.saveText = function () {
        return Ads.saveText(ctrl.text).$promise
        .then(function() { Alert.success('Text Data Saved'); })
        .catch(function(err) { Alert.error(err.data.message); });
      };
    }]
  };
}];

angular.module('ept').directive('adManager', directive);
