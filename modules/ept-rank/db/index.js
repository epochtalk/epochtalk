var path = require('path');
var dbc = require(path.normalize(__dirname + '/db'));
var db = dbc.db;

// Administrative db methods
function add(data) {
  var q = 'INSERT INTO ranks(rank_name, threshold) VALUES($1, $2) RETURNING id';
  return db.scalar(q, [ data.rank_name, data.threshold ])
  .then(function(rank) {
    return {
      id: rank.id,
      rank_name: data.rank_name,
      threshold: data.threshold
    };
  });
}

function update(data) {
  var q = 'UPDATE ranks SET rank_name = $1, threshold = $2 WHERE id = $3 RETURNING id, rank_name, threshold';
  return db.scalar(q, [ data.rank_name, data.threshold, data.id ]);
}

function remove(id) {
  var q = 'DELETE FROM ranks WHERE id = $1 RETURNING id, rank_name, threshold';
  return db.scalar(q, [ id ]);
}

function get() {
  var q = 'SELECT id, rank_name, threshold FROM ranks ORDER BY threshold DESC';
  return db.sqlQuery(q);
}

// Public facing db methods
function getUserRank(userId) {
  var q = 'SELECT r.rank_name FROM ranks r INNER JOIN ranks_users ru ON (r.id = ru.rank_id) WHERE ru.user_id = $1';
  return db.scalar(q, [ userId ]);
}

module.exports = {
  add: add,
  update: update,
  remove: remove,
  get: get,
  getUserRank: getUserRank
};
