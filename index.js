'use strict';
var config = require('./config');
var site = require('./site');
console.log('Config: ' + JSON.stringify(config));

site.listen(config.port);
console.log('Listening on port: ' + config.port);

