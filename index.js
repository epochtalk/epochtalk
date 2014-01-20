var restify = require('restify');

var server = restify.createServer({
  name: 'xrc-api',
  version: '0.1.0'
});
server.use(restify.acceptParser(server.acceptable));
server.use(restify.queryParser());
server.use(restify.bodyParser());

server.post('/messages', function (req, res, next) {
  var channelId = req.params.channel_id;
  var body = req.params.body
  res.send(req.params);
  return next();
});

server.listen(8080, function () {
  console.log('%s listening at %s', server.name, server.url);
});
