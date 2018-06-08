var ctrl = ['Alert', 'Merit', 'statsData', '$location', function(Alert, Merit, statsData, $location) {
    var ctrl = this;
    this.selectedType = statsData.type;
    this.statsData = statsData;
    this.loading = false;

    this.typeToDesc = {
      recent: 'Recent Merits',
      top_threads: 'Top-merited Threads, Recent',
      top_threads_all: 'Top-merited Threads, All-Time',
      top_replies: 'Top-merited Replies, Recent',
      top_replies_all: 'Top-merited Replies, All-Time',
      top_users: 'Top-merited Users, Recent',
      top_users_all: 'Top-merited Users, All-Time',
      top_senders: 'Top Merit Senders, Recent',
      top_senders_all: 'Top Merit Senders, All-Time',
      sources: 'Merit Sources'
    };

    this.types = Object.keys(this.typeToDesc);

    this.selectType = function(type) {
      var prevType = ctrl.selectedType;
      var prevStats = angular.copy(ctrl.statsData);
      ctrl.selectedType = type;
      ctrl.statsData = null;
      ctrl.loading = true;
      return Merit.getStatistics({ type: type }).$promise
      .then(function(data) {
        $location.search({ type: type });
        ctrl.statsData = data;
      })
      .catch(function() {
        ctrl.statsData = prevStats;
        ctrl.selectedType = prevType;
        Alert.error('There was an error fetching the merit statistics, please try again later or contact an administrator.');
      })
      .finally(function() { ctrl.loading = false; });
    };

  }
];

module.exports = angular.module('bct.merit-statistics.ctrl', [])
.controller('MeritStatsCtrl', ctrl)
.name;
