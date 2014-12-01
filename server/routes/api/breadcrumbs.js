var core = require('epochcore')();
var Hapi = require('hapi');
var breadcrumbValidator = require('epoch-validator').api.breadcrumbs;

// Route handlers/configs
var breadcrumbs = {};
breadcrumbs.byType = {
  handler: function(request, reply) {
    // Core menthod type enum
    var findType = {
      board: core.boards.find,
      category: core.boards.allCategories,
      thread: core.threads.find,
      post: core.posts.find
    };

    // Type enum
    var type = {
      board: 'board',
      category: 'category',
      thread: 'thread',
      post: 'post'
    };

    // Recursively Build breadcrumbs
    var buildCrumbs = function(id, curType, crumbs) {
      if (!id) { return crumbs; }
      return findType[curType](curType !== type.category ? id : undefined)
      .then(function(obj) {
        var nextType, nextId;
        if (curType === type.category) { // Category
          var catName = obj[id-1].name;
          var anchorId = '/boards#' + catName.split(' ').join('-') + '-' + id;
          crumbs.push({ label: catName, url: anchorId.toLowerCase()});
        }
        else if (curType === type.board) { // Board
          if (!obj.parent_id && obj.category_id) { // Has no Parent
            nextType = type.category;
            nextId = obj.category_id;
          }
          else { // Has Parent
            nextType = type.board;
            nextId = obj.parent_id;
          }
          crumbs.push({ label: obj.name, url: '/boards/' + id });
        }
        else if (curType === type.thread) { // Thread
          crumbs.push({ label: obj.title, url: '/threads/' + id + '/posts'});
          nextType = type.board;
          nextId = obj.board_id;
        }
        else if (curType === type.post) { // Post
          crumbs.push({ label: obj.title, url: '/posts/' + id});
          nextType = type.thread;
          nextId = obj.thread_id;
        }
        return buildCrumbs(nextId, nextType, crumbs);
      });
    };

    // Build the breadcrumbs and reply
    return buildCrumbs(request.query.id, request.query.type, [])
    .then(function(breadcrumbs) { reply(breadcrumbs.reverse()); })
    .catch(function() { reply(Hapi.error.internal());});
  },
  validate: { query: breadcrumbValidator.schema.byType }
};

// Export Routes
exports.routes = [
  { method: 'GET', path: '/breadcrumbs', config: breadcrumbs.byType }
];
