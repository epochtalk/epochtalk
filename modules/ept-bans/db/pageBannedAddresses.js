var path = require('path');
var dbc = require(path.normalize(__dirname + '/db'));
var db = dbc.db;
var common = require(path.normalize(__dirname + '/common'));

module.exports = function(opts) {
  opts = opts || { page: 1, limit: 25 };
  // Set defaults
  var limit = 25;
  var page = 1;
  var sortField = 'created_at';
  var sortOrder = opts.desc ? 'DESC' : 'ASC';
  var search = opts.search;

  // Build results object for return
  var results = Object.assign({}, opts);
  results.prev = results.page > 1 ? results.page - 1 : undefined;

  // Calculate query vars
  if (opts.limit) { limit = opts.limit; }
  if (opts.page) { page = opts.page; }
  if (opts.field) {
    sortField = opts.field;
    // If sortfield is updates, sort by the last timestamp in updates array
    if (sortField === 'updates') {
      sortField = 'CASE WHEN updates[array_upper(updates, 1)] IS NULL THEN 1 else 0 END, updates[array_upper(updates, 1)] ' + sortOrder + ', created_at';
    }
    else if (sortField === 'update_count') {
      sortField = 'CASE WHEN array_upper(updates, 1) IS NULL THEN 0 ELSE array_upper(updates, 1) END';
    }
  }

  // Base paging query for banned addresses
  var baseQuery = 'SELECT hostname, ip1, ip2, ip3, ip4, weight, decay, created_at, updates, updates[array_upper(updates, 1)] as updated_at, array_upper(updates, 1) AS update_count, imported_at FROM banned_addresses';

  // Calculate pagination vars
  var offset = (page * limit) - limit;
  limit = limit + 1; // query one extra result to see if theres another page

  var q, params;
  if (search) { // Update query to accomodate search
    var searchArr = search.split('.');
    var whereClause = 'WHERE hostname LIKE $1 OR CAST(ip1 AS TEXT) LIKE $1';
    params = ['%' + search + '%', offset, limit];
    // Append like clause for each arr element
    var ipParamStart = 4;
    for(var x = 0; x < searchArr.length; x++) {
      var clause = x === 0 ? ' OR' : ' AND';
      whereClause += clause + ' CAST(ip' + (x + 1) + ' AS TEXT) LIKE $' + (x + ipParamStart);
      params.push(searchArr[x]);
    }
    q = [baseQuery, whereClause, 'ORDER BY', sortField, sortOrder, 'OFFSET $2', 'LIMIT $3'].join(' ');
  }
  else { // Join query and opts ( no search )
    q = [baseQuery, 'ORDER BY', sortField, sortOrder, 'OFFSET $1', 'LIMIT $2'].join(' ');
    params = [offset, limit];
  }


  // Run query
  return db.sqlQuery(q, params)
  .then(function(data) {
    // Check for next page then remove extra record
    if (data.length === limit) {
      results.next = page + 1;
      data.pop();
    }
    return data;
  })
  .map(function(address) {
    // Calculate current weight
    address.weight = common.calculateScoreDecay(address);

    // Replace wildcard % with *
    if (address.hostname) {
      address.hostname = address.hostname.replace(new RegExp('%', 'g'), '*');
    }
    // Remove Hostname if not present and calculate joined ip address
    else {
      delete address.hostname;
      address.ip = [address.ip1, address.ip2, address.ip3, address.ip4].join('.');
    }

    // Remove individual IP fields
    delete address.ip1;
    delete address.ip2;
    delete address.ip3;
    delete address.ip4;
    return address;
  })
  .then(function(data) {
    // Append banned addresses data to results
    results.data = data;
    return results;
  });
};
