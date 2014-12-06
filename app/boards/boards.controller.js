module.exports = ['$timeout', '$anchorScroll', 'boards',
  function($timeout, $anchorScroll, boards) {
    var ctrl = this;

    this.toggles = {};

    boards.$promise.then(function(allBoards) {
      ctrl.categorizedBoards = allBoards;
      var i = 0;
      allBoards.forEach(function() {
        ctrl.toggles[i++] = false;
      });
      $timeout($anchorScroll);
    });

    this.toggle = function(index){
      ctrl.toggles[index] = !ctrl.toggles[index];
    };
  }
];
