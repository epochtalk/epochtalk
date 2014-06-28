'use strict';
var fs = require('fs');
var usage = fs.readFileSync(__dirname + '/usage', 'utf-8');
var yargs = require('yargs')
  .options('i', {alias : 'import'})
  .usage(usage);
var argv = yargs.argv;
var config = require(__dirname + '/../server/config');

if (argv.recreate) {
  console.log('This feature is not implemented right now.');
}
else if (argv.create) {
  console.log('This feature is not implemented right now.');
}
else if (argv.update) {
  console.log('This feature is not implemented right now.');
}
else if (argv.seed) {
  console.log('This feature is not implemented right now.');
}
else if (argv.i) {
  console.log('This feature is not implemented right now.');
}
else {
  console.log(yargs.help());
}
