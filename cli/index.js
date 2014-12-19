var path = require('path');
var program = require('commander');
var schema = require('epoch-core-pg/schema');
program
  .version('0.0.1')
  .option('--recreate', 'Recreated database.')
  .option('-b, --backup [path]', 'Backup database at [path] or default to epoch.db in the current working directory if path is not provided')
  .option('-r, --restore <path/url>', 'Restore database from backup at <path/url>')
  .option('--seed', 'Seed database with test data (Developer)')
  .parse(process.argv);

var genericArgs = {
  debug: program.debug,
  verbose: program.verbose,
  db: program.leveldb || path.join(process.env.PWD, 'epoch.db')
};

if (program.recreate) schema.recreate();
else {
  program.help();
}
