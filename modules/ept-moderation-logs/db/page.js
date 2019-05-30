var path = require('path');
var dbc = require(path.normalize(__dirname + '/db'));
var db = dbc.db;
var helper = dbc.helper;

module.exports = function(opts) {
  // Defaults for limit and page
  var limit = 25;
  var page = 1;

  // Build results object for return
  var results = Object.assign({}, opts);
  results.prev = results.page > 1 ? results.page - 1 : undefined;

  // Calculate query vars
  var mod, action, keyword, bdate, adate, sdate, edate;
  var searchedModId; // if populated search is for a moderator's userId
  if (opts && opts.limit) { limit = opts.limit; }
  if (opts && opts.page) { page = opts.page; }
  if (opts && opts.mod) {
    mod = opts.mod;
    // Try to deslugify mod to determine if it is a userId
    searchedModId = helper.deslugify(mod);
    var uuidv4 = /^[a-fA-F0-9]{8}-[a-fA-F0-9]{4}-[a-fA-F0-9]{4}-[a-fA-F0-9]{4}-[a-fA-F0-9]{12}$/;
    searchedModId = new RegExp(uuidv4).test(searchedModId) ? searchedModId : undefined;
    mod = searchedModId || '%' + mod + '%';
  }
  if (opts && opts.action) { action = opts.action; }
  if (opts && opts.keyword) { keyword = '%' + opts.keyword + '%'; }
  if (opts && opts.bdate) { bdate = opts.bdate; }
  if (opts && opts.adate) { adate = opts.adate; }
  if (opts && opts.sdate) { sdate = opts.sdate; }
  if (opts && opts.edate) { edate = opts.edate; }

  // Dynamically build query and params
  var baseQuery = 'SELECT mod_username, mod_id, mod_ip, action_api_url, action_api_method, action_obj, action_taken_at, action_type, action_display_text, action_display_url FROM moderation_log';

  var query = [ baseQuery ];
  var params = [];

  var paramPos, clauseSep, clause;

  // 1) Append mod data to query and params if present
  if (mod) {
    params.push(mod);
    paramPos = params.length;
    clauseSep = 'WHERE';
    clause = clauseSep + (
      searchedModId ? // bool indicating if mod field was an id
      ' mod_id = $' + paramPos : // if mod is an id then search for id match
      ' (LOWER(mod_username) LIKE LOWER($' + paramPos + ') OR LOWER(mod_ip) LIKE LOWER($' + paramPos + '))'
    );
    query.push(clause);
  }

  // 2) Append action to query and params if present
  if (action) {
    params.push(action);
    paramPos = params.length;
    clauseSep = paramPos === 1 ? 'WHERE' : 'AND';
    clause = clauseSep + ' action_type = $' + paramPos;
    query.push(clause);
  }

  // 3) Append keyword to query and params if present
  if (keyword) {
    params.push(keyword);
    paramPos = params.length;
    clauseSep = paramPos === 1 ? 'WHERE' : 'AND';
    clause = clauseSep + ' LOWER(action_display_text) LIKE LOWER($' + paramPos + ')';
    query.push(clause);
  }

  // 4) Append date to query and params if present
  if (bdate || adate || (sdate && edate)) {
    if (bdate) { // Before Date
      params.push(bdate);
      paramPos = params.length;
      clauseSep = paramPos === 1 ? 'WHERE' : 'AND';
      clause = clauseSep + ' action_taken_at < $' + paramPos;
    }
    else if (adate) { // After Date
      params.push(adate);
      paramPos = params.length;
      clauseSep = paramPos === 1 ? 'WHERE' : 'AND';
      clause = clauseSep + ' action_taken_at > $' + paramPos;
    }
    else { // Between Dates (start and end)
      params.push(sdate);
      params.push(edate);
      paramPos = params.length;
      clauseSep = paramPos === 2 ? 'WHERE' : 'AND';
      clause = clauseSep + ' action_taken_at > $' + (paramPos - 1) + ' AND action_taken_at < $' + paramPos;
    }
    query.push(clause);
  }

  // 5) Lastly, append order, offset and limit
  params.push((page * limit) - limit); // offset
  params.push(limit + 1); // query one extra to see if there's another page
  paramPos = params.length;
  clause = 'ORDER BY action_taken_at DESC OFFSET $' + (paramPos - 1) + ' LIMIT $' + paramPos;
  query.push(clause);

  // Join the array of clauses into a single string
  query = query.join(' ').replace('  ', ' ');

  return db.sqlQuery(query, params)
  .then(function(logs) {
    // If extra record is present there is a next page
    if (logs.length === limit + 1) {
      results.next = page + 1;
      logs.pop();
    }
    results.data = logs;
    return results;
  })
  .then(helper.slugify);
};
