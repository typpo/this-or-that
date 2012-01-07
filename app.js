var express = require('express');
var app = express.createServer();
var url = require('url');
var http = require('http');

app.set('views', __dirname + '/views');
app.set('view engine', 'jade');

app.get('/', function(req, res) {
  res.render('index', {title: 'App Name'});
});

app.use(express.static(__dirname + '/public'));
app.listen(8080);
