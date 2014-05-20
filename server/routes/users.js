module.exports = function(api) {
  api.route('/users').get(function(req, res) {
    return res.json({foo: 'bar'});
  });

  api.route('/users/register').post(function(req, res) {
    console.log(req.body);

    return res.end();
  });
};
