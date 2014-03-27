var express = require('express');
var RedisStore = require('connect-redis')(express);
var config = require('./config');
var app = express();
var engines = require('consolidate');

app.engine('haml', engines.haml);
app.set('view engine', 'haml');
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.cookieParser('adness'));
app.use(express.bodyParser());
app.use(express.methodOverride());
app.use(express.json());
app.use(express.urlencoded());
app.use(express.session({
  store: new RedisStore({
    host: config.redis.host,
    port: config.redis.port,
  }),
  cookie: {
    secure: false,
    maxAge:86400000
  }
}));

app.get('/', function(req, res){
  return res.render('home', {greeting: 'asdf'});
});

module.exports = app;
