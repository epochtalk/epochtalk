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
    return client.queryAsync(q, params)
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
      q = 'SELECT * FROM boards b JOIN metadata.boards mb ON mb.board_id = b.id WHERE b.id = $1 FOR UPDATE';
      return client.queryAsync(q, params)
      .then(function(results) { oldBoard = results.rows[0]; });
    })
    // lock thread's new board/Meta row
    .then(function() {
      params = [newBoardId];
      q = 'SELECT * FROM boards b JOIN metadata.boards mb ON mb.board_id = b.id WHERE b.id = $1 FOR UPDATE';
      return client.queryAsync(q, params)
      .then(function(results) { newBoard = results.rows[0]; });
    })
    // update thread's current board metadata row
    .then(function() {
      params = [thread.post_count, oldBoard.board_id];
      q = 'UPDATE boards SET (thread_count, post_count) = (thread_count - 1, post_count - $1) WHERE id = $2';
      return client.queryAsync(q, params);
    })
    // update thread's new board metadata row
    .then(function() {
      params = [thread.post_count, newBoard.board_id];
      q = 'UPDATE boards SET (thread_count, post_count) = (thread_count + 1, post_count + $1) WHERE id = $2';
      return client.queryAsync(q, params);
    })
    // update thread's board_id with new board id
    .then(function() {
      params = [newBoardId, threadId];
      q = 'UPDATE threads SET board_id = $1 WHERE id = $2';
      return client.queryAsync(q, params);
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
