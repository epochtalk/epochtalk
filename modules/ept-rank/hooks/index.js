function getRankData(request) {
  return request.db.rank.getMaps()
  .then(function(maps) {
    request.pre.processed.metadata = {};
    request.pre.processed.metadata.rank_metric_maps = maps;
    return request.db.rank.getRanks();
  })
  .then(function(ranks) { request.pre.processed.metadata.ranks = ranks; });
}

module.exports = [
  { path: 'posts.byThread.post', method: getRankData },
  { path: 'users.find.post', method: getRankData }
];
