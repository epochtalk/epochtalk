var repl = require('repl');
var db = require(__dirname + '/../server/db');

var local = repl.start('epoch> ');
local.context.db = db;
