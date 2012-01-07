var express = require('express');
var app = express.createServer();
var url = require('url');
var http = require('http');
var fs = require('fs');
var im = require('imagemagick');
var path = require('path');

// Express config
app.set('views', __dirname + '/views');
app.set('view engine', 'jade');

app.use(express.cookieParser());
app.use(express.session({ secret: "keyboard cat" }));


// Load data
var groups = [];
groups[0] = fs.readFileSync(__dirname + '/public/groups/meta0', 'ascii');
groups[1] = fs.readFileSync(__dirname + '/public/groups/meta1', 'ascii');

var files = [];
files[0] = clean_file_list('/public/groups/0');
files[1] = clean_file_list('/public/groups/1');

// App
app.get('/', function(req, res) {
  var grp, imgfile, imgpath = null;
  do {
    grp = Math.random() < .5 ? 0 : 1;
    imgfile = files[0][Math.floor(Math.random() * files[0].length)];
    imgpath = '/groups/' + grp + '/' + imgfile;
  } while (imgpath == req.session.last);
  lazy_image_resize(__dirname + '/public' + imgpath, function(err, fullpath) {
    // Convert full path to relative path
    var newpath = path.relative(__dirname + '/public', fullpath);
    req.session.last = imgpath;
    res.render('index', {
      title: 'App Name',
      img: newpath,
      groups: groups,
    });
  });
});

// Return list of files without ones that have been resized
function clean_file_list(path) {
  var fullpath = __dirname + path;
  var files = fs.readdirSync(fullpath)
  var ret = [];
  for (var i=0; i < files.length; i++) {
    if (files[i].indexOf('-sized') < 0) {
      ret.push(files[i]);
    }
  }
  return ret;
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
