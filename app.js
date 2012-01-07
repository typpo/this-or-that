var express = require('express');
var app = express.createServer();
var url = require('url');
var http = require('http');
var fs = require('fs');

app.set('views', __dirname + '/views');
app.set('view engine', 'jade');


var groups = [];
groups[0] = fs.readFileSync(__dirname + '/public/groups/meta0', 'ascii');
groups[1] = fs.readFileSync(__dirname + '/public/groups/meta1', 'ascii');

var files = [];
files[0] = fs.readdirSync(__dirname + '/public/groups/0');
files[1] = fs.readdirSync(__dirname + '/public/groups/1');

app.get('/', function(req, res) {
  var grp = Math.random() < .5 ? 0 : 1;
  var imgfile = files[0][Math.floor(Math.random() * files[0].length)];
  var imgpath = '/groups/' + grp + '/' + imgfile;
  res.render('index', {
    title: 'App Name',
    img: imgpath,
    groups: groups,
  });
});

app.use(express.static(__dirname + '/public'));
app.listen(8080);
