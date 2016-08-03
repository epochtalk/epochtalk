var Boom = require('boom');

exports.register = function(plugin, options, next) {
  options = options || {};

  plugin.ext('onPostAuth', function(request, reply) {
    var backoffSwitch = request.route.settings.plugins.backoff;
    if (!backoffSwitch) { return reply.continue(); }

    // variables
    var db = request.db.db;
    var path = request.route.path;
    var remoteAddress = request.info.remoteAddress;
    var method = request.route.method.toUpperCase();

    // pull records for this ip and method/path
    return getAccessLogs(db, remoteAddress, path, method)
    // calculate backoff pressure
    .then(calculatePressure)
    // log route (ip, path, method, timestamp)
    .tap(function() { return appendLog(db, remoteAddress, path, method); })
    // reject or allow connection
    .then(function(allowed) {
      if (allowed) { return reply.continue(); }
      else { return reply(Boom.tooManyRequests('Abuse Detected')); }
    });
  });

  plugin.expose('release', releasePressure);

  next();
};

function getAccessLogs(db, ip, path, method) {
  var q = `
    SELECT ip, route, method, created_at
    FROM backoff
    WHERE ip = $1 AND route = $2 AND method = $3
    ORDER BY created_at DESC LIMIT 10`;
  return db.sqlQuery(q, [ip, path, method]);
}

function calculatePressure(rows) {
  var allow = false;
  var lastTimestamp, endDate;
  var iterationCount = rows.length;
  if (rows.length) { lastTimestamp = rows[0].created_at; }
  var times = [0, 0, 1000*60, 1000*60*2, 1000*60*4, 1000*60*16, 1000*60*256];

  if (iterationCount < 2) { endDate = 0; }
  else if (iterationCount < 7) {
    endDate = lastTimestamp.getTime() + times[iterationCount];
  }
  else {
    endDate = lastTimestamp.getTime() + 1000 * 60 * 65536;
  }

  if (Date.now() > endDate) { allow = true; }
  return allow;
}

function appendLog(db, ip, path, method) {
  var q = `
    INSERT INTO backoff (ip, route, method, created_at)
    VALUES ($1, $2, $3, now());
  `;
  return db.sqlQuery(q, [ip, path, method]);
}

function releasePressure(db, ip, path, method) {
  var q = `DELETE FROM backoff WHERE ip = $1 AND route = $2 AND method = $3`;
  return db.sqlQuery(q, [ip, path, method]);
}


exports.register.attributes = {
  name: 'backoff',
  version: '1.0.0'
};
