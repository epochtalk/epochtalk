var dbc = require('epochtalk-core-pg')({ conString: process.env.DATABASE_URL });
module.exports = dbc;
