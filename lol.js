var Promise = require('bluebird');
var spends = [
  { time: 0, amount: 11 },
  { time: 1, amount: 15 },
  { time: 2, amount: 9 },
  { time: 3, amount: 11 },
  { time: 4, amount: 1 },
  { time: 5, amount: 4 },
  { time: 6, amount: 57 },
  { time: 7, amount: 9 },
  { time: 10, amount: 11 },
  { time: 20, amount: 9 },
  { time: 22, amount: 11 },
  { time: 40, amount: 1 },
  { time: 42, amount: 1 },
  { time: 50, amount: 4 },
  { time: 52, amount: 9 },
  { time: 53, amount: 11 },
  { time: 54, amount: 1 },
  { time: 59, amount: 4 },
  { time: 60, amount: 4 }
];
// limits per time window, with allocation time
var sources = [
  { time: -1, amount: 0 },
  { time: 3, amount: 11 },
  { time: 10, amount: 15 },
  // { time: 25, amount: 9 },
  // { time: 30, amount: 11 },
  { time: 50, amount: 4 }
];
var timeWindow = 5;
// total excess
var excessSent = 0;

// loop-updateable
var range = [];
var rangeSum = 0;
var sourcePos = 0;

Promise.each(spends, function(spend) {
  // if there is a next source amount
  // and
  // the current spend's time is at or after the next source amount
  if (sourcePos < sources.length - 1 && spend.time >= sources[sourcePos+1].time) {
    console.log('RESET FOR SOURCE');
    // update the source pos
    sourcePos++;
    // clear the range sum
    rangeSum = 0;
    // clear the range array
    range = [];
  }
  // clear the range until it's within the window
  while (range.length > 0 && (spend.time - range[0].time > timeWindow)) {
    console.log('FF RANGE; TIMEDIFF:', spend.time - range[0].time, 'rangelength:', range.length);
    // remove the entry and subtract from sum
    var entry = range.shift();
    rangeSum -= entry.amount;
  }
  // accumulate excess sent
  // remaining source = sources[sourcePos].amount - range sum
  // don't double count spends
  var remainingSource = Math.max(sources[sourcePos].amount - rangeSum, 0);
  excessSent += Math.max(spend.amount - remainingSource, 0);
  // add to sum and insert the entry at the end
  rangeSum += spend.amount;
  range.push(spend);
})
.then(function(originalArray) {
  console.log(originalArray);
  console.log(excessSent);
});

