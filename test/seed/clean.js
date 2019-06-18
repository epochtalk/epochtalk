require('dotenv').load({ silent: true });
var path = require('path');
var Promise = require('bluebird');
var core = require(path.normalize(__dirname + '/../../core'))({ conString: process.env.TEST_DATABASE_URL });
var db = core.db;
var close = core.close;

// create a function to clear rows from all tables
module.exports = function() {
  return db.sqlQuery(`CREATE OR REPLACE FUNCTION truncate_tables(username IN VARCHAR) RETURNS void AS $$
    DECLARE
      statements CURSOR FOR
        SELECT tablename FROM pg_tables
        WHERE tableowner = username AND schemaname = 'public';
      BEGIN
        FOR stmt IN statements LOOP
          EXECUTE 'TRUNCATE TABLE ' || quote_ident(stmt.tablename) || ' CASCADE;';
        END LOOP;
      END;
  $$ LANGUAGE plpgsql;`)
  .then(function() {
    return db.scalar(`SELECT current_user`);
  })
  .then(function(user) {
    // clear rows from all tables
    return db.sqlQuery(`SELECT truncate_tables($1)`, [user.current_user]);
  })
  .then(function(nothing) {
    // delete the function created earlier
    return db.sqlQuery(`DROP FUNCTION truncate_tables(username VARCHAR);`);
  })
  .then(function() {
    close();
  })
  .catch(function(error) {
    console.error(error);
    close();
  });
};
