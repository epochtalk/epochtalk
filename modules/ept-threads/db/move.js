var path = require('path');
var Promise = require('bluebird');
var dbc = require(path.normalize(__dirname + '/db'));
var db = dbc.db;
var helper = dbc.helper;
var errors = dbc.errors;
var NotFoundError = errors.NotFoundError;
var ConflictError = errors.ConflictError;
var using = Promise.using;

module.exports = function(threadId, newBoardId) {
  threadId = helper.deslugify(threadId);
  newBoardId = helper.deslugify(newBoardId);
  var q, params;
  var thread;
  var oldBoard, newBoard;
  return using(db.createTransaction(), function(client) {
    // lock thread/Meta row
    params = [threadId];
    q = 'SELECT * FROM threads t JOIN metadata.threads mt ON mt.thread_id = t.id WHERE t.id = $1 FOR UPDATE';
    return client.query(q, params)
    .then(function(results) {
      if (results.rows.length > 0) { thread = results.rows[0]; }
      else { throw new NotFoundError('Thread Not Found'); }
    })
    .then(function() {
      if (thread.board_id === newBoardId) {
        throw new ConflictError('New Board Id matches current Board Id');
      }
    })
    // lock thread's current board/Meta row
    .then(function() {
      params = [thread.board_id];
      q = 'SELECT b.id, b.name, b.description, b.created_at, b.updated_at, b.imported_at, b.post_count, b.thread_count, b.viewable_by, b.postable_by, mb.id as metadata_id, mb.board_id, mb.last_post_username, mb.last_post_created_at, mb.last_thread_id, mb.last_thread_title, mb.last_post_position FROM boards b JOIN metadata.boards mb ON mb.board_id = b.id WHERE b.id = $1 FOR UPDATE';
      return client.query(q, params)
      .then(function(results) { oldBoard = results.rows[0]; });
    })
    // lock thread's new board/Meta row
    .then(function() {
      params = [newBoardId];
      q = 'SELECT b.id, b.name, b.description, b.created_at, b.updated_at, b.imported_at, b.post_count, b.thread_count, b.viewable_by, b.postable_by, mb.id as metadata_id, mb.board_id, mb.last_post_username, mb.last_post_created_at, mb.last_thread_id, mb.last_thread_title, mb.last_post_position FROM boards b JOIN metadata.boards mb ON mb.board_id = b.id WHERE b.id = $1 FOR UPDATE';
      return client.query(q, params)
      .then(function(results) { newBoard = results.rows[0]; });
    })
    // update thread's current board metadata row
    .then(function() {
      params = [thread.post_count, oldBoard.board_id];
      q = 'UPDATE boards SET (thread_count, post_count) = (thread_count - 1, post_count - $1) WHERE id = $2';
      return client.query(q, params);
    })
    // update thread's new board metadata row
    .then(function() {
      params = [thread.post_count, newBoard.board_id];
      q = 'UPDATE boards SET (thread_count, post_count) = (thread_count + 1, post_count + $1) WHERE id = $2';
      return client.query(q, params);
    })
    // update thread's board_id with new board id
    .then(function() {
      params = [newBoardId, threadId];
      q = 'UPDATE threads SET board_id = $1 WHERE id = $2';
      return client.query(q, params);
    })
    .then(function() {
      var updateOld = updateLastPostInfo(oldBoard.id, client);
      var updateNew = updateLastPostInfo(newBoardId, client);
      return Promise.join(updateOld, updateNew);
    })
    // Return old board's id and name for reference
    .then(function() {
      return {
        old_board_name: oldBoard.name,
        old_board_id: oldBoard.id
      };
    });
  })
  .then(helper.slugify); // Promise disposer called at this point
};

function updateLastPostInfo(boardId, client) {
  var params = [boardId];
  var q = `SELECT t.board_id, t.id as thread_id, (SELECT p.content->>'title' as title FROM posts p WHERE p.thread_id = t.id ORDER BY created_at ASC LIMIT 1), (SELECT u.username FROM users u WHERE u.id = lp.user_id), lp.created_at, lp.position FROM threads t JOIN (SELECT p2.thread_id, p2.created_at, p2.user_id, p2.position FROM posts p2 WHERE p2.thread_id = (SELECT id from threads WHERE board_id = $1 limit 1) ORDER BY p2.created_at DESC LIMIT 1) lp ON lp.thread_id = (SELECT id from threads WHERE board_id = $1 limit 1) WHERE t.board_id = $1 ORDER BY t.created_at DESC LIMIT 1;`;
  return client.query(q, params)
  .then(function(results) {
    var lastInfo = results.rows[0];
    if (lastInfo) {
      params = [lastInfo.username, lastInfo.created_at, lastInfo.thread_id, lastInfo.title, lastInfo.position, boardId];
    }
    else {
      params =  [null, null, null, null, null, boardId];
    }
    q = 'UPDATE metadata.boards SET (last_post_username, last_post_created_at, last_thread_id, last_thread_title, last_post_position) = ($1, $2, $3, $4, $5) WHERE board_id =  $6';
    return client.query(q, params);
  });
}
