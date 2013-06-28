var mongodb = require('./db');
var ObjectID= require('mongodb').ObjectID;

function Post(username, post,post_to,time,pname,image,sub_id,id) {
  this.user = username;
  this.post_to = post_to;
  this.post = post;
  if (time) {
    this.time = time;
  } else {
    this.time = new Date();
  }
	this.update=this.time;
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
	if (id) {
		this.id=id;
	}
	if (sub_id) {
		this.sub_id=sub_id;
	}

};

module.exports = Post;

Post.prototype.save = function save(callback) {
  // 存入 Mongodb 的文檔
  var post = {
    user: this.user,
    post: this.post,
    post_to: this.post_to,
    time: this.time,
		pname: this.pname,
		image: this.image,
		sub_id: this.sub_id,
    update: this.update,
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
			
			
			//console.log("post=",post);

      collection.insert(post, {safe: true}, function(err, posts) {
				if (err) {
					mongodb.close();
					return callback(err);
				}
				mongodb.close();
				callback(err,posts);
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
			query.sub_id=null;

      collection.find(query).sort({time: -1}).limit(20).toArray(function(err, docs) {
        mongodb.close();
        if (err) {
          callback(err, null);
        }

        var posts = [];
        docs.forEach(function(doc, index) {

					//console.log("------:",doc._id);
          var post = new Post(doc.user, doc.post, doc.post_to,doc.time,doc.pname,doc.image,doc.sub_id,doc._id);
          posts.push(post);
        });
        callback(null, posts);
      });
    });
  });
};

Post.getSubPost = function getpostpost(sub_id, callback) {
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
      if (sub_id) {
        query.sub_id= sub_id;
      }
      collection.find(query).sort({time: -1}).toArray(function(err, docs) {
        mongodb.close();
        if (err) {
          callback(err, null);
        }

        var posts = [];
        docs.forEach(function(doc, index) {

//					console.log("------:",doc._id);
          var post = new Post(doc.user, doc.post,doc.post_to, doc.time,doc.pname,doc.image,doc.sub_id,doc._id);
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
				//console.log('query:',docs);
        if (err) {
					console.log(err);
          callback(err, null);
        }

        var posts = [];
        docs.forEach(function(doc, index) {

          //var post = new Post(doc.user, doc.post, doc.time,doc.pname,doc.image,doc.sub_id);
          var post = new Post(doc.user, doc.post, doc.post_to,doc.time,doc.pname,doc.image,doc.sub_id,doc._id);
          posts.push(post);
        });
        callback(null, posts);
      });
    });
  });
};
