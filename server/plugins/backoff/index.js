var Boom = require('boom');

module.exports = {
  name: 'backoff',
  version: '1.0.0',
  register: async function(plugin, options) {
    options = options || {};

    plugin.ext('onPostAuth', function(request, reply) {
      var backoffSwitch = request.route.settings.plugins.backoff;
      if (!backoffSwitch) { return reply.continue; }

      // variables
      var db = request.db.db;
      var remoteAddress = request.info.remoteAddress;

      // pull records for this ip
      return getAccessLogs(db, remoteAddress)
      // calculate backoff pressure
      .then(calculatePressure)
      // log route (ip, timestamp)
      .tap(function() { return appendLog(db, remoteAddress); })
      // reject or allow connection
      .then(function(allowed) {
        if (allowed) { return reply.continue; }
        else { return reply(Boom.tooManyRequests('Abuse Detected')); }
      });
    });

    plugin.expose('release', releasePressure);
    plugin.expose('getAccessLogs', getAccessLogs);
    plugin.expose('getLockoutTimes', getLockoutTimes);
  }
};

function getAccessLogs(db, ip) {
  var q = `
    SELECT ip, route, method, created_at
    FROM backoff
    WHERE ip = $1 AND route = $2 AND method = $3
    ORDER BY created_at DESC LIMIT 10`;
  return db.sqlQuery(q, [ip, '/api/recover', 'POST']);
}

function getLockoutTimes() {
  return [0, 0, 0, 1000*60, 1000*60*2, 1000*60*4, 1000*60*16, 1000*60*256];
}

function calculatePressure(rows) {
  var allow = false;
  var lastTimestamp, endDate;
  var iterationCount = rows.length;
  if (rows.length) { lastTimestamp = rows[0].created_at; }
  var times = getLockoutTimes();

  if (iterationCount < 3) { endDate = 0; }
  else if (iterationCount < 8) {
    endDate = lastTimestamp.getTime() + times[iterationCount];
  }
  else {
    endDate = lastTimestamp.getTime() + 1000 * 60 * 65536;
  }

  if (Date.now() > endDate) { allow = true; }
  return allow;
}

function appendLog(db, ip) {
  var q = `
    INSERT INTO backoff (ip, route, method, created_at)
    VALUES ($1, $2, $3, now());
  `;
  return db.sqlQuery(q, [ip, '/api/recover', 'POST']);
}

function releasePressure(db, ip) {
  var q = `DELETE FROM backoff WHERE ip = $1 AND route = $2 AND method = $3`;
  return db.sqlQuery(q, [ip, '/api/recover', 'POST']);
}
