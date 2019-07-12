var common = {};
module.exports = common;

var _ = require('lodash');

function boardsClean(sanitizer, payload) {
  // payload is an array
  payload.map(function(board) {
    // name
    board.name = sanitizer.strip(board.name);

    // description
    if (board.description) {
      board.description = sanitizer.display(board.description);
    }
  });
}

function boardStitching(boardMapping, currentBoard, userPriority, opts) {
  opts = opts || {};

  var hasChildren = _.find(boardMapping, function(board) {
    return board.parent_id === currentBoard.id;
  });

  if (hasChildren) {
    // filter children
    currentBoard.children = _.filter(boardMapping, function(board) {
      return  board.parent_id === currentBoard.id;
    });

    // sort by view_order
    currentBoard.children = _.sortBy(currentBoard.children, 'view_order');

    // remove private boards (optional)
    if (opts.hidePrivate) {
      currentBoard.children = _.filter(currentBoard.children, function(board) {
        if (board.viewable_by !== 0 && !board.viewable_by) { return true; }
        else { return userPriority <= board.viewable_by; }
      });
    }

    // recurse for any children
    currentBoard.children.map(function(childBoard) {
      return boardStitching(boardMapping, childBoard, userPriority, opts);
    });

    return currentBoard;
  }
  else {
    currentBoard.children = [];
    return currentBoard;
  }
}

common.boardStitching = boardStitching;

common.export = () =>  {
  return [
    {
      name: 'common.boards.clean',
      method: boardsClean
    }
  ];
};
