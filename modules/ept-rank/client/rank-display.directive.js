var html= `Ranks: {{vm.ranks}}
  <br> Maps: {{vm.maps}}
  <br> User: {{vm.user}}`;

var directive = [function() {
  return {
    restrict: 'E',
    scope: true,
    bindToController: { ranks: '=', maps: '=', user: '='},
    template: html,
    controllerAs: 'vm',
    controller: [function() {
      var ctrl = this;

      console.log(ctrl.ranks);
      console.log(ctrl.user);
      console.log(ctrl.maps);

      // calculate the rank of the user
      var metricToRankMaps = ctrl.maps;
      // map the metrics to ranks
      var ranks = Object.keys(metricToRankMaps).reduce(function(mappedRanks, metricName) {
        var rank = 0;
        for (var i = 0; i < metricToRankMaps[metricName].length; i++) {
          if (ctrl.user[metricName] >= metricToRankMaps[metricName][i]) {
            rank = i;
          }
          else {
            break;
          }
        }
        mappedRanks.push(rank);
        return mappedRanks;
      }, []);
      // order the ranks and pluck the lowest rank
      ranks.sort(function(a, b) { return a > b });
      this.userRank = this.ranks[ranks[0]].name;
    }]
  };
}];


angular.module('ept').directive('rankDisplay', directive);
