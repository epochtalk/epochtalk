exports.port = process.env.PORT || 8080;
exports.elasticsearch = {
  url: 'http://127.0.0.1:9200/tng',
  pageSize: 20
}
exports.redis = { host: '127.0.0.1', port: 6379 }