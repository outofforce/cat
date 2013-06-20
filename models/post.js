var mongodb = require('./db');

function Post(username, post, time,pname,image) {
  this.user = username;
  this.post = post;
  if (time) {
    this.time = time;
  } else {
    this.time = new Date();
  }
	if (pname) {
	  this.pname = pname;
	} else {
		this.pname = '*';
	}
	if (image) {
		this.image=image;
	} else {
		this.image="*";
	}
};

module.exports = Post;

Post.prototype.save = function save(callback) {
  // 存入 Mongodb 的文檔
  var post = {
    user: this.user,
    post: this.post,
    time: this.time,
		pname: this.pname,
		image: this.image,
  };
  mongodb.open(function(err, db) {
    if (err) {
      return callback(err);
    }
    db.collection('posts', function(err, collection) {
      if (err) {
        mongodb.close();
        return callback(err);
      }
      collection.ensureIndex('user');
      collection.ensureIndex('pname');
			console.log("New :",post);
			
      collection.insert(post, {safe: true}, function(err, post) {
        mongodb.close();
        callback(err, post);
      });
    });
  });
};

Post.get = function get(username, callback) {
  mongodb.open(function(err, db) {
    if (err) {
      return callback(err);
    }

    db.collection('posts', function(err, collection) {
      if (err) {
        mongodb.close();
        return callback(err);
      }

      var query = {};
      if (username) {
        query.user = username;
      }
      collection.find(query).sort({time: -1}).limit(20).toArray(function(err, docs) {
        mongodb.close();
        if (err) {
          callback(err, null);
        }

        var posts = [];
        docs.forEach(function(doc, index) {
          var post = new Post(doc.user, doc.post, doc.time,doc.pname,doc.image);
          posts.push(post);
        });
        callback(null, posts);
      });
    });
  });
};


Post.getByPNameAndUser = function get(pname,username,callback) {
  mongodb.open(function(err, db) {
    if (err) {
      return callback(err);
    }

    db.collection('posts', function(err, collection) {
      if (err) {
        mongodb.close();
        return callback(err);
      }

      var query = {};
      if (username) {
        query.user = username;
      }
      if (pname) {
        query.pname = pname;
      }

      collection.find(query).sort({time: -1}).limit(20).toArray(function(err, docs) {
        mongodb.close();
				console.log('query:',docs);
        if (err) {
					console.log(err);
          callback(err, null);
        }

        var posts = [];
        docs.forEach(function(doc, index) {

          var post = new Post(doc.user, doc.post, doc.time,doc.pname,doc.image);
          posts.push(post);
        });
        callback(null, posts);
      });
    });
  });
};
