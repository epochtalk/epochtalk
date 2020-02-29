var ctrl = ['Alert', 'pageData', function(Alert, pageData) {
    var ctrl = this;
    this.posts = pageData;
  }
];

module.exports = angular.module('bct.patroller.newbieCtrl', [])
.controller('NewbieCtrl', ctrl)
.name;
