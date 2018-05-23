var path = require('path');
var Promise = require('bluebird');
var dbc = require(path.normalize(__dirname + '/db'));
var db = dbc.db;
var using = Promise.using;
var c = require(path.join(__dirname, '..', '..', '..', 'metrics-configuration.json'));

if (c) {
  customMaps(c);
}

// Server-only db methods
function customMaps(ranksAndMetricsMaps){
  var clearRanks = 'DELETE FROM ranks';
  var clearMetricsMaps = 'DELETE FROM metric_rank_maps';
  var createRank = 'INSERT INTO ranks(name, number) VALUES($1, $2)';
  var createMetricsMap = 'INSERT INTO metric_rank_maps(maps) VALUES($1)';

  return using(db.createTransaction(), function(client) {
    return Promise.join(client.query(clearRanks), client.query(clearMetricsMaps))
    // create ranks
    .then(function() {
      return Promise.map(ranksAndMetricsMaps.ranks, function(rank, index) {
        return client.query(createRank, [ rank, index]);
      });
    })
    // create metrics maps jsonb
    .then(function() {
      return Promise.map(ranksAndMetricsMaps.metricsMaps, function(metricsMap) {
        return client.query(createMetricsMap, [ metricsMap ]);
      });
    });
  })
  .then(function() { return ranksAndMetricsMaps; });
}

// Administrative db methods
function upsert(ranks){
  var clearRanks = 'DELETE FROM ranks';
  var clearMetricMaps = 'DELETE FROM metric_rank_maps';
  var createRank = 'INSERT INTO ranks(name, number) VALUES($1, $2)';
  var createMetricMaps = 'INSERT INTO metric_rank_maps(maps) VALUES($1)';

  ranks.sort(function(a, b) { return b.post_count < a.post_count });

  return using(db.createTransaction(), function(client) {
    return client.query(clearRanks)
    .then(function() { return client.query(clearMetricMaps); })
    .then(function() {
      var postCountThresholds = [];
      return Promise.map(ranks, function(rank, idx) {
        postCountThresholds.push(rank.post_count);
        return client.query(createRank, [ rank.name, idx ]);
      })
      .then(function() {
        var map = { post_count: postCountThresholds };
        return client.query(createMetricMaps, [ map ]);
      });
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
        return {
          name: rank.name,
          post_count: dbMaps.maps.post_count[idx]
        };
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
