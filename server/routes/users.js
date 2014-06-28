var passport = require(__dirname + '/../passport');

module.exports = function(api) {
  api.route('/users').get(function(req, res) {
    return res.json({foo: 'bar'});
  });

  api.route('/users/register').post(function(req, res) {
    console.log('Register User.');
    var user = req.body;
    return res.end();
  });

  api.route('/users/login').post(function(req, res, next) {
    var user = req.body;
    req.login(user, function(err) {
      if (err) {
        return next(err);
      }
      else {
        console.log('login');
        return res.json({success: true});
      }
    });
  });

  api.route('/users/logout').delete(function(req, res, next) {
    req.logout();
    res.json({logged_out: true});
  });
};
