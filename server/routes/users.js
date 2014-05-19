module.exports = function(api) {
  api.route('/users').get(function(req, res) {
    return res.json({foo: 'bar'});
  });
};
