require('dotenv').load({silent: true});
var parseDatabaseUrl = require("parse-database-url");
var dbConfig = parseDatabaseUrl(process.env["DATABASE_URL"]);
const exec = require('child_process').exec;

exec('createdb ' + dbConfig.database, (error, stdout, stderr) => {
  if (error === null) {
    console.log(`[createdb]: ${stdout}`);
    exec(`psql ${dbConfig.database} < schema.sql`, (error, stdout, stderr) => {
      if (error === null) {
        console.log(`[migrate]: ${stdout}`);
      }
    });
  }
  else {
    console.log(`exec error: ${error}`);
  }
});
