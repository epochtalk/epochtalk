var ctrl = ['Ads', 'Alert', 'pageData',
  function(Ads, Alert, pageData) {
    // page variables
    var ctrl = this;

    // index variables
    this.analytics = pageData.analytics;
    this.round = pageData.round.viewing;
    this.currentRound = pageData.round.current;
    this.nextRound = pageData.round.next;
    this.previousRound = pageData.round.previous;
    this.roundStartTime = pageData.round.start_time;
    this.roundEndTime = pageData.round.end_time;
    this.roundPeriod = generateRoundPeriod(ctrl.roundStartTime, ctrl.roundEndTime);

    // pull round
    this.pullRound = function(direction) {
      var newRound = ctrl.nextRound;
      if (direction === 'previous') { newRound = ctrl.previousRound; }
      return Ads.analytics({round:newRound}).$promise
      .then(function(data) {
        ctrl.analytics = data.analytics;
        ctrl.round = data.round.viewing;
        ctrl.currentRound = data.round.current;
        ctrl.nextRound = data.round.next;
        ctrl.previousRound = data.round.previous;
        ctrl.roundStartTime = data.round.start_time;
        ctrl.roundEndTime = data.round.end_time;
        ctrl.roundPeriod = generateRoundPeriod(ctrl.roundStartTime, ctrl.roundEndTime);
      })
      .catch(function(err) { Alert.error(err.data.message); });
    };

    function generateRoundPeriod(start, end) {
      if (!start) { return; }
      else { start = new Date(start); }
      if (!end) { return; }
      else { end = new Date(end); }
      var oneDay = 24*60*60*1000;
      var diffDays = Math.abs((start.getTime() - end.getTime())/(oneDay));
      return diffDays.toFixed(2) + ' days';
    }
  }
];

module.exports = angular.module('ept.ads.analytics.ctrl', [])
.controller('AdAnalyticsCtrl', ctrl)
.name;
