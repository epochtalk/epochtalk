var core = require('epochtalk-core-pg');
module.exports = core(process.env.DATABASE_URL);
