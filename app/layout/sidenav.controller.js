module.exports = [function() {
  var ctrl = this;
  this.toggles = {
    general: false,
    manage: false,
    settings: false,
    advanced: false
  };

  this.toggle = function(index){
    ctrl.toggles[index] = !ctrl.toggles[index];
  };
}];
