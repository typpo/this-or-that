var express = require('express');
var app = express.createServer();
var mongo =require('mongodb');
var im = require('imagemagick');

var url = require('url');
var http = require('http');
var fs = require('fs');
var path = require('path');
var sha1 = require('sha1');

// Settings
var config = {
  MAX_SEEN_CACHE: 4,
  MAX_SEEN_CACHE_LIMIT: 10,

  RESIZE_WIDTH: 500,

}

// Express config
app.set('views', __dirname + '/views');
app.set('view engine', 'jade');

app.use(express.cookieParser());
app.use(express.session({secret: "some key"}));
app.use(express.static(__dirname + '/public'));

// Load data
var groups = [];
groups[0] = fs.readFileSync(__dirname + '/public/groups/meta0', 'ascii').trim();
groups[1] = fs.readFileSync(__dirname + '/public/groups/meta1', 'ascii').trim();

var current_competition = slugify(groups[0] + ' or ' + groups[1]);
var votes = {};

var files = [];
var file_id_mapping = {};
files[0] = clean_file_list('/public/groups/0');
files[1] = clean_file_list('/public/groups/1');

var numfiles = files[0].length + files[1].length;
config.MAX_SEEN_CACHE = Math.min(config.MAX_SEEN_CACHE,
    numfiles > config.MAX_SEEN_CACHE_LIMIT
    ? Math.floor((numfiles-1) / 2) : numfiles-1);

// App
app.get('/', function(req, res) {
  if (!req.session.last
    || req.session.last.length >= config.MAX_SEEN_CACHE) {
    req.session.last = [];
  }

  var grp, imgfile, imgpath = null;
  do {
    grp = Math.random() < .5 ? 0 : 1;
    imgfile = files[grp][Math.floor(Math.random() * files[grp].length)];
    imgpath = '/groups/' + grp + '/' + imgfile;
  } while (req.session.last.indexOf(imgpath) > -1
    || req.session.last_seen == imgpath);
  console.log('chose ' + imgpath);

  lazy_image_resize(__dirname + '/public' + imgpath, function(err, fullpath) {
    // Convert full path to relative path
    var newpath = path.relative(__dirname + '/public', fullpath);
    req.session.last.push(imgpath);
    req.session.last_seen = imgpath;
    res.render('index', {
      title: '___ or ___?',
      img: newpath,
      groups: groups,
    });
  });
});

app.get('/vote/:img/:choice', function(req, res) {
  var path = file_id_mapping[req.params.img];
  var choice = parseInt(req.params.choice);
  if (isNaN(choice) || choice > 1) {
    return;
  }

  /*
  db.collection(current_competition, function(err, collection) {
    collection.insert(

  });
    */
  if (!(path in votes)) {
    votes[path] = [0, 0];
  }
  votes[path][choice]++;
  res.end('true');
});

// Return list of files without ones that have been resized
function clean_file_list(path) {
  var fullpath = __dirname + path;
  var dirfiles = fs.readdirSync(fullpath)
  var ret = [];
  for (var i=0; i < dirfiles.length; i++) {
    if (dirfiles[i].indexOf('-sized') < 0) {
      ret.push(dirfiles[i]);
    }
  }
  generate_id_mapping(ret);
  return ret;
}

// Resizes image if necessary
// callback(err, resized-aboslute-path)
function lazy_image_resize(abs_raw_path, cb) {
  var newpath = abs_raw_path.slice(abs_raw_path, abs_raw_path.lastIndexOf('.'))
    + '-sized' + path.extname(abs_raw_path);
  path.exists(newpath, function(exists) {
    if (exists) {
      cb(false, newpath);
    }
    else {
      console.log('resizing ' + abs_raw_path+ ' to ' + newpath);
      im.resize({
        srcPath: abs_raw_path,
        dstPath: newpath,
        width: config.RESIZE_WIDTH,
      }, function(err, stdout, stderr){
        if (err) throw err
        console.log('generated ' + newpath);
        cb(false, newpath);
      });
    }
  });

}

function generate_id_mapping(dirfiles) {
  for (var i=0; i < dirfiles.length; i++) {
    file_id_mapping[sha1(dirfiles[i])] = dirfiles[i];
  }
}

function slugify(str) {
  // TODO move this to some utility file
  str = str.trim().toLowerCase()
      .replace(/[^a-z0-9 -]/g, '') // remove invalid chars
      .replace(/\s+/g, '-') // collapse whitespace and replace by -
      .replace(/-+/g, '-'); // collapse dashes
  return str;
}


// Database
console.log('Connecting to db');

var Db = mongo.Db,
    Connection = mongo.Connection,
    Server = mongo.Server;

var db = new Db('comparison', new Server("127.0.0.1", 27017, {}));
db.open(function(err, db) {
  console.log('Connected to db');
  app.listen(8080);
});
