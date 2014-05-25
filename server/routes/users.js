var db = require(__dirname + '/../db');

module.exports = function(api) {
  api.route('/users').get(function(req, res) {
    return res.json({foo: 'bar'});
  });

  api.route('/users/register').post(function(req, res) {
    console.log('Register User.');
    var user = req.body;
    db.users.register(user);
    return res.end();
  });

  api.route('/users/login').post(function(req, res) {
    console.log('Login User.');
    var user = req.body;
    db.users.login(user, function(err, user) {
      if (err) {
        return res.send(406, err);
      }
      else {
        return res.end();
      }
    });
  });
};
