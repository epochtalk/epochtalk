var Promise = require('bluebird');
var things = [
  { crab: 0, dog: 11 },
  { crab: 1, dog: 15 },
  { crab: 2, dog: 9 },
  { crab: 3, dog: 11 },
  { crab: 4, dog: 1 },
  { crab: 5, dog: 4 },
  { crab: 6, dog: 57 }
];
// excess
var dakine = 0;
var range = [];

Promise.each(things, function(thing) {
  if (thing.dog > 5) {
    dakine += thing.crab;
  }
}).then(function(array) {
  console.log(array);
  console.log(dakine);
});

