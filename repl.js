#!/usr/bin/env node
var repl = require('repl');
var db = require('./server/db');

var local = repl.start('epoch> ');
local.context.db = db;
