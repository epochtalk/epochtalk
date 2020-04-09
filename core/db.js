var db = {};
module.exports = db;
var pg = require('pg');
pg.defaults.parseInputDatesAsUTC = true;
var path = require('path');
var Promise = require('bluebird');
var config = require(path.join(__dirname, 'config'));
var errors = require(path.join(__dirname, 'errors'));

var pool = new pg.Pool(config);

pool.on('error', (err) => {
  console.error('Unexpected error on idle client', err);
  process.exit(-1);
});

db.pool = pool;

db.testConnection = function() {
  return new Promise(function(resolve, reject) {
    pool.connect((err) => {
      if (err) { return reject(err); }
      else { return resolve(); }
    });
  });
};

db.sqlQuery = function(q, params) {
  return new Promise(function(resolve, reject) {
    pool.connect((err, client, done) => {
      if (err) { return reject(err); }
      else { return resolve([client, done]); }
    });
  })
  .spread(function(client, done) {
    return client.query(q, params)
    .then(function(result) {
      done();
      return result.rows;
    })
    .catch(e => {
      done();
      throw e;
    });
  })
  .catch(errors.handlePgError);
};

db.scalar = function(q, params) {
  return new Promise(function(resolve, reject) {
    pool.connect((err, client, done) => {
      if (err) { return reject(err); }
      else { return resolve([client, done]); }
    });
  })
  .spread(function(client, done) {
    return client.query(q, params)
    .then(function(result) {
      var ret = null;
      if (result && result.rows.length > 0) { ret = result.rows[0]; }
      done();
      return ret;
    })
    .catch(e => {
      done();
      throw e;
    });
  })
  .catch(errors.handlePgError);
};

db.createTransaction = function() {
  var close;
  return new Promise(function(resolve, reject) {
    pool.connect((err, client, done) => {
      if (err) { return reject(err); }
      else { return resolve([client, done]); }
    });
  })
  .spread(function(client, done) {
    close = done;
    return client.query('BEGIN')
    .then(function() { return client; });
  })
  .disposer(function(client, promise) {
    function closeConnection() { if (close) { close(); } }

    if (promise.isFulfilled()) {
      return client.query('COMMIT').then(closeConnection);
    }
    else {
      return client.query('ROLLBACK')
      .then(closeConnection)
      .catch(function(err) {
        if (close) { close(client); }
        if (err) { return errors.handlePgError(err); }
      });
    }
  });
};
