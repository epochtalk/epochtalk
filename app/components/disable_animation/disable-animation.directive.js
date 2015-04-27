module.exports = ['$animate', function ($animate) {
  return function (scope, element) { $animate.enabled(false, element); };
}];
