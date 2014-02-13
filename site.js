var express = require('express');
var site = express();

site.get('/', function(req, res){
  res.json({foo: 'bar'});
});

module.exports = site;
