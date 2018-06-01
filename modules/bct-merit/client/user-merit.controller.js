var ctrl = ['user', 'statistics', function(user, statistics) {
    var ctrl = this;
    this.user = user;
    this.statistics = statistics;
  }
];

module.exports = angular.module('bct.merit.ctrl', [])
.controller('UserMeritCtrl', ctrl)
.name;
