module.exports = {
  port: process.env.PORT || 8080,
  redis: {
    host: process.env.REDIS_HOST || '127.0.0.1',
    port: process.env.REDIS_PORT || 6379
  },
  couchdb: {
    url: 'http://localhost:5984',
    dbname: 'tng'
  }
};
