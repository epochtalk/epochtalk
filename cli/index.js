var path = require('path');
var program = require('commander');

program
  .version('0.0.1')
  .option('--create [database]', 'Recreate [database]. Default: config.json{database} OR epochtalk)')
  .parse(process.argv);

var genericArgs = {
  debug: program.debug,
  verbose: program.verbose,
  db: program.leveldb || path.join(process.env.PWD, 'epoch.db')
};

if (program.create) {
  console.log('asdf');
}
else {
  program.help();
}
