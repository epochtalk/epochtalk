'use strict';
var config = require(__dirname + '/config');
var site = require(__dirname + '/site');
console.log('Config: ' + JSON.stringify(config));
site.listen(config.port);
console.log('Listening on port: ' + config.port);
