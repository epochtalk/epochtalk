var path = require('path');
var dbc = require(path.normalize(__dirname + '/db'));
var db = dbc.db;
var helper = dbc.helper;

module.exports = function(opts) {
  var limit = 25;
  var page = 1;

  // Build results object for return
  var results = Object.assign({}, opts);
  results.prev = results.page > 1 ? results.page - 1 : undefined;

  // Calculate query vars
  var modId, boardId, search;
  var searchUserId; // if populated search keyword is a userId
  if (opts && opts.limit) { limit = opts.limit; }
  if (opts && opts.page) { page = opts.page; }
  if (opts && opts.userId) { modId = opts.userId; }
  if (opts && opts.boardId) { boardId = opts.boardId; }
  if (opts && opts.search) { // search can be a username, email or userId
    search = opts.search;
    // Try to deslugify search to determine if it is a userId
    searchUserId = helper.deslugify(search);
    var uuidv4 = /^[a-fA-F0-9]{8}-[a-fA-F0-9]{4}-[a-fA-F0-9]{4}-[a-fA-F0-9]{4}-[a-fA-F0-9]{12}$/;
    searchUserId = new RegExp(uuidv4).test(searchUserId) ? searchUserId : undefined;
    search = searchUserId || '%' + search + '%';
  }

  // Dynamically build query and params
  var baseQuery = 'SELECT u.username, u.id as user_id, u.created_at, u.email, array_agg(b.id) as board_ids, array_agg(b.name) as board_names FROM users.board_bans ubb JOIN users u ON u.id = ubb.user_id JOIN boards b ON b.id = ubb.board_id';
  var groupByClause = 'GROUP BY u.username, u.id';
  var query = [ baseQuery, groupByClause ]; // Array used to build query
  var params = []; // holds parameters
  var paramPos; // tracks position of current parameter

  // 1) Append filter to query which only returns data for moderated boards
  if (modId) {
    params.push(helper.deslugify(modId));
    paramPos = params.length;
    query.unshift('SELECT * FROM (');
    query.push(') AS mdata WHERE mdata.board_ids && (SELECT array_agg(board_id) AS board_ids FROM board_moderators WHERE user_id = $' + paramPos + ')::uuid[]');
  }

  // 2) Append filter to query which only returns users banned from a specific board
  if (boardId) {
    params.push(helper.deslugify(boardId));
    paramPos = params.length;
    query.unshift('SELECT * FROM (');
    query.push(') AS bdata WHERE $' + paramPos + ' = ANY(bdata.board_ids)');
  }

  // 3) Append search to query and params if present
  if (search) {
    params.push(search);
    paramPos = params.length;
    var clauseSep = paramPos === 1 ? 'WHERE' : 'AND';
    var clause = clauseSep + (
      searchUserId ?
      ' user_id = $' + paramPos :
      ' (username LIKE $' + paramPos + ' OR LOWER(email) LIKE LOWER($' + paramPos + '))'
    );
    // GROUP BY must be after WHERE clause if a search without filters is being performed
    if (clauseSep === 'WHERE') { query = [ baseQuery, clause, groupByClause ]; }
    else { query.push(clause); }
  }

  // 4) Append offset and limit
  // Calculate Offset
  var offset = (page * limit) - limit;
  params.push(offset);
  // query one extra to see if there's another page
  limit = limit + 1;
  params.push(limit);
  paramPos = params.length;
  query.push('ORDER by username OFFSET $' + (paramPos - 1) + ' LIMIT $' + paramPos);

  // Join the array of clauses into a single string
  query = query.join(' ').replace('  ', ' ');

  return db.sqlQuery(query, params)
  .then(function(data) {
    // Change userId for mod back to modded
    results.modded = results.userId ? true : undefined;
    delete results.userId;

    // Change boardId back to board
    results.board = results.boardId;
    delete results.boardId;

    // Check for next page then remove extra record
    if (data.length === limit) {
      results.next = page + 1;
      data.pop();
    }
    // Append page data and slugify
    results.data = helper.slugify(data);
    return results;
  });
};
