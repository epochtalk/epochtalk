require('dotenv').load();
var parseDatabaseUrl = require("parse-database-url");
var dbConfig = parseDatabaseUrl(process.env["DATABASE_URL"]);
const exec = require('child_process').exec;
const child = exec('pg_dump -Oxs ' + dbConfig.database + ' > schema.sql',
  (error, stdout, stderr) => {
    console.log('Database schema outputted to schema.sql');
    // console.log(`stdout: ${stdout}`);
    // console.log(`stderr: ${stderr}`);
    if (error !== null) {
      console.log(`exec error: ${error}`);
    }
});
