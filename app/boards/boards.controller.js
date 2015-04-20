var _ = require('lodash');

module.exports = ['$timeout', '$anchorScroll', 'boards',
  function($timeout, $anchorScroll, boards) {
    var ctrl = this;

    this.toggles = {};

    var sortedCats = _.sortBy(boards, function(cat) { return cat.view_order; });
    this.categorizedBoards = sortedCats;
    var i = 0;
    sortedCats.forEach(function() { ctrl.toggles[i++] = false; });
    $timeout($anchorScroll);

    this.toggle = function(index){
      ctrl.toggles[index] = !ctrl.toggles[index];
    };
  }
];
