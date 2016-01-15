var path = require('path');
var _ = require('lodash');
var db = require(path.normalize(__dirname + '/../../../db'));
var Boom = require('boom');
var ipAddress = require('ip-address');
var Address4 = ipAddress.Address4;
var Address6 = ipAddress.Address6;
var blacklist = {};

exports.register = function(server, options, next) {

  server.ext('onRequest', function(request, reply) {
    var ip = request.headers['x-forwarded-for'] || request.info.remoteAddress;
    if (Object.keys(blacklist).length && ipBlacklisted(ip)) {
      var err = Boom.forbidden();
      return reply(err);
    }
    else { return reply.continue(); }
  });

  server.expose('retrieveBlacklist', retrieveBlacklist);

  return retrieveBlacklist().then(next);
};

function ipBlacklisted(requesterIp) {
  var blocked = false;

  // Check if requesterIp is ipv4 or ipv6
  var requesterIpObj = new Address4(requesterIp);
  if (!requesterIpObj.valid) { requesterIpObj = new Address6(requesterIp); }

  // If requester has a valid ip check it against the blacklist
  if (requesterIpObj.valid) {
    for (var i = blacklist.length; i--;) {
      var blacklistObj = blacklist[i];

      // Wildcard Type: Check if ip starts with wildcard
      if (blacklistObj.type === 0) {
        var ipArr = requesterIpObj.parsedAddress;
        var blArr = blacklistObj.ip_data.split('.');
        blocked = (blArr[0] === '*' || blArr[0] === ipArr[0]) &&
          (blArr[1] === '*' || blArr[1] === ipArr[1]) &&
          (blArr[2] === '*' || blArr[2] === ipArr[2]) &&
          (blArr[3] === '*' || blArr[3] === ipArr[3]);
      }
      // Range IP Type: Check if requester ip falls within range
      else if (blacklistObj.type === 1) {
        var requesterBigInt = requesterIpObj.bigInteger();
        blocked = requesterBigInt.compareTo(blacklistObj.start) > -1 &&
          requesterBigInt.compareTo(blacklistObj.end) < 1;
      }
      // Standard IP Type: check for exact match on parsed address
      else { blocked = _.isEqual(requesterIpObj.parsedAddress, blacklistObj.parsedAddress); }

      // break loop if we find a match on blacklisted ip
      if (blocked) { break; }
    }
  }
  else { blacklist = true; } // requester's ip is invalid blacklist it

  return blocked;
}

function retrieveBlacklist() {
  return db.blacklist.all()
  .map(function(ipInfo) {
    var ipData = ipInfo.ip_data;

    // wildcard
    if (ipData.indexOf('*') > -1) { ipInfo.type = 0; }
    // range
    else if (ipData.indexOf('-') > -1) {
      ipInfo.type = 1;
      // Calculate start and end bigInts for range
      var split = ipInfo.ip_data.split('-');
      var start = new Address4(split[0]);
      var end = new Address4(split[1]);
      // ipv4 wasn't valid so must be ipv6
      if (!start.valid) {
        start = new Address6(split[0]);
        end = new Address6(split[1]);
      }
      ipInfo.start = start.bigInteger();
      ipInfo.end = end.bigInteger();
    }
    // standard ip: check for exact match
    else {
      ipInfo.type = 2;
      var addr = new Address4(ipData);
      if (!addr.valid) { addr = new Address6(ipData); }
      ipInfo.parsedAddress  = addr.parsedAddress;
    }

    return ipInfo;
  })
  .then(function(data) { blacklist = data; });
}

exports.register.attributes = {
  name: 'blacklist',
  version: '1.0.0'
};
