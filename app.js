var express = require('express');
var app = express.createServer();
var url = require('url');
var http = require('http');
var fs = require('fs');
var im = require('imagemagick');
var path = require('path');

app.set('views', __dirname + '/views');
app.set('view engine', 'jade');


var groups = [];
groups[0] = fs.readFileSync(__dirname + '/public/groups/meta0', 'ascii');
groups[1] = fs.readFileSync(__dirname + '/public/groups/meta1', 'ascii');

var files = [];
files[0] = clean_file_list('/public/groups/0');
files[1] = clean_file_list('/public/groups/1');


app.get('/', function(req, res) {
  var grp = Math.random() < .5 ? 0 : 1;
  var imgfile = files[0][Math.floor(Math.random() * files[0].length)];
  var imgpath = '/groups/' + grp + '/' + imgfile;
  lazy_image_resize(__dirname + '/public' + imgpath, function(err, fullpath) {
    // Convert full path to relative path
    var newpath = path.relative(__dirname + '/public', fullpath);
    res.render('index', {
      title: 'App Name',
      img: newpath,
      groups: groups,
    });
  });
});

// Removes resized files
function clean_file_list(path) {
  var fullpath = __dirname + path;
  var files = fs.readdirSync(path)
  for (var i=0; i < files.length; i++) {
    if (files[i].indexOf('-sized') > -1) {
      files.remove(i);
      i--;
    }
  }
  return files;
}

// Resizes image if necessary
// callback(err, resized-aboslute-path)
function lazy_image_resize(abs_raw_path, cb) {
  var newpath = abs_raw_path.slice(abs_raw_path, abs_raw_path.lastIndexOf('.'))
    + '-sized' + path.extname(abs_raw_path);
  console.log('checking ' + abs_raw_path+ ' to ' + newpath);
  path.exists(newpath, function(exists) {
    if (exists) {
      console.log('found ' + newpath);
      cb(false, newpath);
    }
    else {
      console.log('resizing ' + abs_raw_path+ ' to ' + newpath);
      im.resize({
        srcPath: abs_raw_path,
        dstPath: newpath,
        width: 300
      }, function(err, stdout, stderr){
        if (err) throw err
        console.log('generated ' + newpath);
        cb(false, newpath);
      });
    }
  });

}

app.use(express.static(__dirname + '/public'));
app.listen(8080);
