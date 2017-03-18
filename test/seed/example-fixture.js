var path = require('path');
var fake = require(path.join(__dirname, 'seed', 'fake'));

// self-reference using a string
// ex: 'users.0.id'
module.exports = {
  run: [
    'categories',
    'boards',
    'threads'
  ],
  methods: {
    categories: fake.userData,
    boards: fake.boardData,
    threads: fake.threadData
  },
  data: {
    /*
    * fake.categoryData();
    */
    categories: [
      {},
      {},
      {},
      {}
    ],
    /*
    * fake.boardData({
    *   parent_board_id: runtime.boards[currentBoard.parentBoard].id,
    *   category_id: runtime.categories[currentBoard.category].id,
    *   children_ids: // function for children indexes to childrens' ids
    * });
    */
    boards: [
      {},
      {},
      {},
      {},
      {},
      {}
    ],
    /*
    * fake.threadData({
    *   board_id: runtime.boards[currentThread.board].id
    * });
    */
    threads: [
      { board_id: 'boards.0.id' },
      { board_id: 'boards.0.id' },
      { board_id: 'boards.0.id' },
      { board_id: 'boards.1.id' },
      { board_id: 'boards.1.id' },
      { board_id: 'boards.1.id' },
      { board_id: 'boards.2.id' },
      { board_id: 'boards.2.id' },
      { board_id: 'boards.2.id' },
      {}
    ]
  }
};
