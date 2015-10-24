var core = require('epochtalk-core-pg');
module.exports = core({ conString: process.env.DATABASE_URL });
