#!/usr/bin/env node
require('dotenv').load();
var path = require('path');
var db = require(path.normalize(__dirname + '/../db'));

db.users.userByUsername('wangbus')
.then(function(me) {
  me.password = 'Slickage1234!';
  return db.users.update(me);
})
.then(function(ret) {
  console.log(ret);
});
