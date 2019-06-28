var config = require('./config');

module.exports = function(opts) {
  // DB connection param overrides
  if (opts && Object.keys(opts).length) {
    Object.assign(config, opts);
  }
  // Default connection information
  else {
    config = {
      host: process.env.PGHOST,
      database: process.env.PGDATABASE,
      port: process.env.PGPORT,
      user: process.env.PGUSER,
      password: process.env.PGPASSWORD
    };
  }
};
