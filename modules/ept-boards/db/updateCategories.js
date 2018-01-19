var path = require('path');
var Promise = require('bluebird');
var dbc = require(path.normalize(__dirname + '/db'));
var db = dbc.db;
var helper = dbc.helper;
var using = Promise.using;

module.exports = function(boardMapping) {
  boardMapping = helper.deslugify(boardMapping);
  var q, params;
  return using(db.createTransaction(), function(client) {
    return Promise.map(boardMapping, function(mapping) {
      var promise;
      // Category
      if (mapping.type === 'category') {
        q = 'UPDATE categories SET name = $1, viewable_by = $2, view_order = $3 WHERE id = $4';
        params = [mapping.name, mapping.viewable_by || null, mapping.view_order, mapping.id];
        promise = client.query(q, params);
      }
      // Uncategorized
      else if (mapping.type === 'uncategorized') {
        q = 'DELETE FROM board_mapping WHERE board_id = $1';
        params = [mapping.id]
        promise = client.query(q, params);
      }
      // Boards
      else if (mapping.type === 'board') {
        q = 'DELETE FROM board_mapping WHERE board_id = $1';
        params = [mapping.id];
        promise = client.query(q, params)
        .then(function() {
          q = 'INSERT INTO board_mapping (board_id, parent_id, category_id, view_order) VALUES ($1, $2, $3, $4);';
          params = [mapping.id, mapping.parent_id, mapping.category_id, mapping.view_order];
          return client.query(q, params);
        });
      }
      return promise;
    });
  });
};
