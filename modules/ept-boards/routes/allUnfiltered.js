/**
  * @apiVersion 0.4.0
  * @apiGroup Categories
  * @api {GET} /boards/unfiltered All Categories (Includes Private)
  * @apiName AdminCategoriesUnfiltered
  * @apiDescription Used to retrieve all boards within their respective categories not filtering private boards.
  *
  * @apiSuccess {object[]} categories An array containing categories and all their boards
  * @apiSuccess {string} categories.id The categories unique id
  * @apiSuccess {string} categories.name The categories name
  * @apiSuccess {number} categories.view_order The categories view order
  * @apiSuccess {timestamp} categories.imported_at If the category was imported, the import date
  * @apiSuccess {number} categories.viewable_by Minimum priority a user must have to view the category, null if no restriction
  * @apiSuccess {number} categories.postable_by Minimum priority a user must have to post in boards within this category, null if no restriction
  * @apiSuccess {object[]} categories.boards Array of boards within this category
  * @apiSuccess {string} categories.boards.id The board's unique id
  * @apiSuccess {string} categories.boards.name The board's name
  * @apiSuccess {string} categories.boards.description The board's description
  * @apiSuccess {number} categories.boards.viewable_by Minimum priority a user must have to view the board, null if no restriction
  * @apiSuccess {number} categories.boards.postable_by Minimum priority a user must have to post in the board, null if no restriction
  * @apiSuccess {number} categories.boards.thread_count Number of threads in the board
  * @apiSuccess {number} categories.boards.post_count Number of posts in the board
  * @apiSuccess {timestamp} categories.boards.created_at Created at date for board
  * @apiSuccess {timestamp} categories.boards.updated_at Last time the board was updated
  * @apiSuccess {timestamp} categories.boards.imported_at If the board was imported at, the time it was imported
  * @apiSuccess {string} categories.boards.last_thread_id The id of the thread last posted in
  * @apiSuccess {string} categories.boards.parent_id If the board is a child board the parent board's id
  * @apiSuccess {string} categories.boards.category_id The id of the board's parent category
  * @apiSuccess {number} categories.boards.view_order The view order of the board
  * @apiSuccess {string} categories.boards.last_thread_title The title of the thread last posted in
  * @apiSuccess {boolean} categories.boards.post_deleted Indicates if the last post in the board was deleted
  * @apiSuccess {timestamp} categories.boards.last_post_created_at Timestamp of the last post in the board's created date
  * @apiSuccess {number} categories.boards.last_post_position The position of the last post within the thread
  * @apiSuccess {string} categories.boards.last_post_username The username of the author of the last post within the board
  * @apiSuccess {string} categories.boards.last_post_avatar The avatar of the author of the last post within the board
  * @apiSuccess {string} categories.boards.user_id The id of the author of the last post within the board
  * @apiSuccess {boolean} categories.boards.user_deleted Boolean which indicates if the last user to post within the board has had their account deleted
  * @apiSuccess {object[]} categories.boards.moderators Array of boards moderators
  * @apiSuccess {string} categories.boards.moderators.id The id of the moderator
  * @apiSuccess {string} categories.boards.moderators.username The username of the moderator
  * @apiSuccess {object[]} categories.boards.children Array of child boards of this board
  *
  * @apiError (Error 500) InternalServerError There was an issue retrieving categories
  */
module.exports = {
  method: 'GET',
  path: '/api/boards/unfiltered',
  config: {
    auth: { strategy: 'jwt' },
    pre: [ { method: (request) => request.server.methods.auth.boards.allUnfiltered(request.server, request.auth) } ]
  },
  handler: function(request, reply) {
    var promise =  request.db.boards.allCategories()
    .error(request.errorMap.toHttpError);

    return promise;
  }
};
