var Promise = require('bluebird');
var sends = [
  // before source
  { time: 0, amount: 11 },
  { time: 1, amount: 15 },
  { time: 2, amount: 9 },
  // use all of source at once
  // not exceeding window
  { time: 3, amount: 11 },
  { time: 4, amount: 1 },
  { time: 5, amount: 4 },
  { time: 6, amount: 57 },
  { time: 7, amount: 9 },
  // single send in time window
  { time: 10, amount: 11 },
  // ff all, then multiple sends per time window
  { time: 20, amount: 9 },
  { time: 22, amount: 11 },
  { time: 23, amount: 12 },
  // ff all, then multiple sends per time window
  { time: 40, amount: 1 },
  { time: 42, amount: 13 },
  { time: 43, amount: 1 },
  { time: 44, amount: 1 },
  { time: 45, amount: 1 },
  { time: 46, amount: 1 }, // should ff here
  { time: 47, amount: 1 },
  { time: 48, amount: 1 }, // should ff here
  { time: 49, amount: 1 }, // should ff here
  { time: 50, amount: 4 }, // should ff here
  { time: 52, amount: 9 }, // should ffx2 here
  { time: 53, amount: 11 }, // should ff here
  { time: 54, amount: 1 }, // should ff here
  { time: 55, amount: 1 }, // should ff here
  { time: 56, amount: 1 }, // should ff here
  { time: 59, amount: 4 }, // should ffx2 here
  { time: 60, amount: 4 },
  { time: 61, amount: 4 }
];
// limits per time window, with allocation time
var sources = [
  { time: -1, amount: 0 },
  { time: 3, amount: 11 },
  { time: 10, amount: 15 },
  // { time: 25, amount: 9 },
  // { time: 30, amount: 11 },
  { time: 60, amount: 4 }
];
var timeWindow = 5;
// total excess
var excessSent = 0;

// loop-updateable
var range = [];
var rangeSum = 0;
var sourcePos = 0;

Promise.each(sends, function(send) {
  // if there is a next source amount
  // and
  // the current send's time is at or after the next source amount
  if (sourcePos < sources.length - 1 && send.time >= sources[sourcePos+1].time) {
    console.log('RESET FOR SOURCE');
    // update the source pos
    sourcePos++;
    // clear the range sum
    rangeSum = 0;
    // clear the range array
    range = [];
  }
  // clear the range until it's within the window
  while (range.length > 0 && (send.time - range[0].time > timeWindow)) {
    console.log('FF RANGE; TIMEDIFF:', send.time - range[0].time, 'rangelength:', range.length);
    // remove the entry and subtract from sum
    var entry = range.shift();
    rangeSum -= entry.amount;
  }
  // accumulate excess sent
  // remaining source = sources[sourcePos].amount - range sum
  // don't double count sends
  var remainingSource = Math.max(sources[sourcePos].amount - rangeSum, 0);
  excessSent += Math.max(send.amount - remainingSource, 0);
  console.log('source for range:', sources[sourcePos]);
  console.log('range:');
  console.log('  sum:', rangeSum);
  console.log('  array:', range);
  console.log('remainingSrc:', remainingSource);
  console.log('send:', send);
  console.log('current excess sent:', Math.max(send.amount - remainingSource, 0));
  console.log('new total excess sent:', excessSent);
  // add to sum and insert the entry at the end
  rangeSum += send.amount;
  range.push(send);
  console.log();
})
.then(function(originalArray) {
  console.log(originalArray);
  console.log(excessSent);
});

