var path = require('path');
var Promise = require('bluebird');
var dbc = require(path.normalize(__dirname + '/db'));
var db = dbc.db;
var using = Promise.using;

// Administrative db methods
function upsert(ranks){
  var clearRanks = 'DELETE FROM ranks';
  var clearMetricMaps = 'DELETE FROM metric_rank_maps';
  var createRank = 'INSERT INTO ranks(name, number) VALUES($1, $2)';
  var createMetricMaps = 'INSERT INTO metric_rank_maps(maps) VALUES($1)';

  return using(db.createTransaction(), function(client) {
    var map = {};
    var fields;
    return client.query(clearRanks)
    .then(function() { return client.query(clearMetricMaps); })
    .then(function() {
      if (ranks.length) {
        fields = Object.keys(ranks[0]).filter(f => f !== "name");
        fields.forEach(f => map[f] = []);
      }
      return Promise.map(ranks, function(rank, idx) {
        fields.forEach(f => map[f].push(rank[f]));
        return client.query(createRank, [ rank.name, idx ]);
      })
      .then(function() { return client.query(createMetricMaps, [ map ]); });
    });
  })
  .then(function() { return ranks; });
}

function get() {
  var queryRank = 'SELECT name FROM ranks ORDER BY number ASC';
  var queryMap = 'SELECT maps FROM metric_rank_maps';
  return db.scalar(queryMap)
  .then(function(dbMaps) {
    if (dbMaps) {
      return db.sqlQuery(queryRank)
      .map(function(rank, idx) {
        var result = {
          name: rank.name
        };

        console.log(dbMaps);
        Object.keys(dbMaps.maps).forEach(function(key) {
          result[key] = dbMaps.maps[key][idx];
        });
        return result;
      });
    }
    else { return []; }
  });
}

// Public db methods
function getMaps() {
  var q = 'SELECT maps FROM metric_rank_maps';
  return db.scalar(q)
  .then(function(data) {
    if (data) { return data.maps; }
    return [];
  });
}

function getRanks() {
  var q = 'SELECT name, number FROM ranks';
  return db.sqlQuery(q);
}

module.exports = {
  upsert: upsert,
  get: get,
  getMaps: getMaps,
  getRanks: getRanks
};
