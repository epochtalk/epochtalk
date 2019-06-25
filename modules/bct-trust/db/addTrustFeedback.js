var path = require('path');
var dbc = require(path.normalize(__dirname + '/db'));
var db = dbc.db;
var helper = dbc.helper;

module.exports = function(opts) {
  var userId = helper.deslugify(opts.userId);
  var reporterId = helper.deslugify(opts.reporterId);
  var riskedBtc = opts.riskedBtc || null;
  var scammer = opts.scammer;
  var reference = opts.reference || null;
  var comments = opts.comments || null;

  if (reference !== null && !reference.match(/^[a-zA-Z]+:\/\//)) {
    reference = 'http://' + reference;
  }

  var q = 'INSERT INTO trust_feedback(user_id, reporter_id, risked_btc, scammer, reference, comments, created_at) VALUES($1, $2, $3, $4, $5, $6, now()) RETURNING id, user_id, reporter_id, scammer, reference, comments, created_at';
  return db.scalar(q, [userId, reporterId, riskedBtc, scammer, reference, comments])
  .then(helper.slugify);
};
