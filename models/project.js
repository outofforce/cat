var mongodb = require('./db');

function Project(pname, desc, time) {
  this.pname= pname;
  this.desc= desc;
  if (time) {
    this.time = time;
  } else {
    this.time = new Date();
  }
};
module.exports = Project;

Project.prototype.save = function save(callback) {
  var project= {
    pname: this.pname,
    desc: this.desc,
    time: this.time,
  };
  mongodb.open(function(err, db) {
    if (err) {
      return callback(err);
    }
    db.collection('projects', function(err, collection) {
      if (err) {
        mongodb.close();
        return callback(err);
      }
      collection.ensureIndex('pname');
			//console.log('inset  : '+project)
      collection.insert(project, {safe: true}, function(err, project) {
        mongodb.close();
        callback(err, project);
      });
    });
  });
};

Project.get = function get(pname, callback) {
  mongodb.open(function(err, db) {
    if (err) {
      return callback(err);
    }
    db.collection('projects', function(err, collection) {
      if (err) {
        mongodb.close();
        return callback(err);
      }
      var query = {};
      if (pname) {
        query.pname= pname;
      }
      collection.find(query).sort({time: -1}).toArray(function(err, docs) {
        mongodb.close();
        if (err) {
          callback(err, null);
        }
				//console.log(docs);
        var projects= [];
        docs.forEach(function(doc, index) {
          var project= new Project(doc.pname, doc.desc, doc.time);
					//console.log(project);
          projects.push(project);
        });
        callback(null, projects);
      });
    });
  });
};
