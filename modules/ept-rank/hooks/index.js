function getRankData(request) {
  return request.db.rank.getMaps()
  .then(function(maps) {
    request.pre.processed.rank_metric_maps = maps;
    return request.db.rank.getRanks();
  })
  .then(function(ranks) {
    request.pre.processed.ranks = ranks;
  });
}

module.exports = [
  { path: 'posts.byThread.post', method: getRankData }
];
