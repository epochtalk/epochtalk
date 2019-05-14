

// Calculates decay given MS and a weight
// Decay algorithm is 0.8897*curWeight^0.9644 run weekly
// This will calculate decay given the amount of time that has passed
// in ms since the weight was last updated
function decayForTime(time, weight) {
  var oneWeek = 1000 * 60 * 60 * 24 * 7;
  var weeks = time / oneWeek;
  var a = 0.8897;
  var r = 0.9644;
  return Math.pow(a, (Math.pow(r, weeks) - 1) / (r - 1)) * Math.pow(weight, Math.pow(r, weeks));
};

// Returns the decayed score given a row
function calculateScoreDecay(row) {
  // Score does decay
  if (row && row.decay) {
    // Current timestamp
    var currentDate = new Date();
    // Length of updates array
    var updatesLen = row.updates.length;
    // Date the record was last updated
    var lastUpdateDate = updatesLen ? row.updates[updatesLen - 1] : new Date(row.created_at);
    // Diff in ms between last update date and current date
    var diffMs = Math.abs(currentDate.getTime() - lastUpdateDate.getTime());
    // Return the decayed score
    return decayForTime(diffMs, row.weight);
  }
  // Score does not decay
  else if (row && !row.decay) { return Number(row.weight); }
  // No match found return 0
  else { return 0; }
};

// Sums an array of numbers
var sumArr = function(arr) {
  return arr.reduce(function(a, b) { return a + b; }, 0);
};

module.exports = {
  // Returns the decayed score given a row
  calculateScoreDecay: calculateScoreDecay,
  sumArr: sumArr
}
