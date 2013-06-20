var mongodb = require('./db');

function Watch(username, pname , time) {
  this.user = username;
  this.pname = pname;
  if (time) {
    this.time = time;
  } else {
    this.time = new Date();
  }
};

module.exports = Watch;

Watch.prototype.save = function save(callback) {
  var watch = {
    user: this.user,
    pname: this.pname,
    time: this.time,
  };
  mongodb.open(function(err, db) {
    if (err) {
      return callback(err);
    }
    db.collection('watches', function(err, collection) {
      if (err) {
        mongodb.close();
        return callback(err);
      }
      collection.ensureIndex('user');
      collection.ensureIndex('pname');
      collection.insert(watch, {safe: true}, function(err, watch) {
        mongodb.close();
        callback(err, watch);
      });
    });
  });
};

Watch.getByUser = function get(username, callback) {
  mongodb.open(function(err, db) {
    if (err) {
      return callback(err);
    }
    db.collection('watches', function(err, collection) {
      if (err) {
        mongodb.close();
        return callback(err);
      }

      var query = {};
      if (username) {
        query.user = username;
      }
      collection.find(query).sort({time: -1}).toArray(function(err, docs) {
        mongodb.close();
        if (err) {
          callback(err, null);
        }
        var watches= [];
        docs.forEach(function(doc, index) {
          var watch= new Watch(doc.user, doc.pname, doc.time);
          watches.push(watch);
        });
        callback(null, watches);
      });
    });
  });
};

Watch.getByPNameAndUser = function get(pname,username,callback) {
  mongodb.open(function(err, db) {
    if (err) {
      return callback(err);
    }
    db.collection('watches', function(err, collection) {
      if (err) {
        mongodb.close();
        return callback(err);
      }

      var query = {};
      if (pname) {
        query.pname = pname;
      }
      if (username) {
        query.user = username;
      }

      collection.find(query).sort({time: -1}).toArray(function(err, docs) {
        mongodb.close();
        if (err) {
          callback(err, null);
        }
        var watches= [];
        docs.forEach(function(doc, index) {
          var watch= new Watch(doc.user, doc.pname, doc.time);
          watches.push(watch);
        });
        callback(null, watches);
      });
    });
  });
};

Watch.getByPName = function get(pname, callback) {
  mongodb.open(function(err, db) {
    if (err) {
      return callback(err);
    }
    db.collection('watches', function(err, collection) {
      if (err) {
        mongodb.close();
        return callback(err);
      }

      var query = {};
      if (pname) {
        query.pname = pname;
      }
      collection.find(query).sort({time: -1}).toArray(function(err, docs) {
        mongodb.close();
        if (err) {
          callback(err, null);
        }
        var watches= [];
        docs.forEach(function(doc, index) {
          var watch= new Watch(doc.user, doc.pname, doc.time);
          watches.push(watch);
        });
        callback(null, watches);
      });
    });
  });
};
