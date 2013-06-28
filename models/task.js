var mongodb = require('./db');
var ObjectID= require('mongodb').ObjectID;

function Task(taskWorker,taskLevel,taskOwner,taskName,taskDesc,taskAttr,taskStatus,relaPname,assigners,img,createTime,updateTime,taskDays,taskPrice,id) {

  this.taskWorker= taskWorker;
  this.taskLevel= taskLevel;
  this.taskOwner = taskOwner;
  this.taskName= taskName;
  this.taskDesc = taskDesc;
  this.taskStatus= taskStatus;
  this.taskAttr= taskAttr;

  this.taskDays= taskDays;
  this.taskPrice= taskPrice;
  if (relaPname) {
    this.relaPname= relaPname;
  } 
	
	if (!createTime) {
    this.createTime= new Date();
  } else {
    this.createTime=createTime;
	}
	if (!updateTime) {
    this.updateTime= this.createTime;
  } else {
    this.updateTime=updateTime;
	}

	if (img) {
		this.img = img;
	} 

	if (id) {
		this.id=id;
	}
	if (assigners) {
		this.assigners = assigners;
	}

};
/*
function Task(t) {
  this.taskWorker= t.taskWorker;
  this.taskLevel= t.taskLevel;
  this.taskOwner = t.taskOwner;
  this.taskName= t.taskName;
  this.taskDesc = t.taskDesc;
  this.taskStatus= t.taskStatus;
  this.taskAttr= t.taskAttr;
  this.taskDays= t.taskDays;
  this.taskPrice= t.taskPrice;
  this.relaPname= t.relaPname;
  this.createTime=t.createTime;
  this.updateTime=t.updateTime;
	this.img = t.img;
	this.assigners = t.assigners;
};
*/


module.exports = Task;

Task.prototype.save = function save(callback) {
  var task= {
    taskOwner: this.taskOwner,
    taskName: this.taskName,
    taskDesc: this.taskDesc,
    taskStatus: this.taskStatus,
		relaPname: this.relaPname,
		assigners: this.assigners,
		img: this.img,
		assigners:this.assigners,
    createTime: this.createTime,
    updateTime: this.updateTime,
    taskAttr: this.taskAttr,
    taskPrice: this.taskPrice,
    taskDays: this.taskDays,
		taskWorker:this.taskWorker,
		taskLevel:this.taskLevel,
  };
  mongodb.open(function(err, db) {
    if (err) {
      return callback(err);
    }
    db.collection('tasks', function(err, collection) {
      if (err) {
        mongodb.close();
        return callback(err);
      }
      collection.ensureIndex('taskOwner');
      collection.ensureIndex('taskWorker');
      collection.ensureIndex('taskName');
			
			

      collection.insert(task, {safe: true}, function(err, tasks) {
				if (err) {
					mongodb.close();
					return callback(err);
				}
				mongodb.close();
				callback(err,tasks);
      });
    });
  });
};

Task.update = function update(id,sets, callback) {
	mongodb.open(function(err, db) {
    if (err) {
      return callback(err);
    }

    db.collection('tasks', function(err, collection) {
      if (err) {
        mongodb.close();
        return callback(err);
      }

      var query = {};
			
			//console.log('query=',id);
			/*
      if (id) {
				query._id=new ObjectID(id);
      }
			*/
			collection.update({_id:new ObjectID(''+id)},{$set:sets},{safe:true},function(err) {
				mongodb.close();
				callback(err);
			});
		});
  });
};


Task.getById= function getById(id, callback) {
	mongodb.open(function(err, db) {
    if (err) {
      return callback(err);
    }

    db.collection('tasks', function(err, collection) {
      if (err) {
        mongodb.close();
        return callback(err);
      }

      var query = {};
      if (id) {
				query._id=new ObjectID(''+id);
      }

      collection.findOne(query,function(err, doc) {
        mongodb.close();
        if (err) {
          callback(err, null);
        }
        var task = new Task(
								doc.taskWorker,
								doc.taskLevel,
								doc.taskOwner,
								doc.taskName,
								doc.taskDesc,
								doc.taskAttr,
								doc.taskStatus,
								doc.relaPname,
								doc.assigners,
								doc.img,
								doc.createTime,
								doc.updateTime,
								doc.taskDays,
								doc.taskPrice,
								doc._id);
        callback(null, task);
      });
		});
  });
};

Task.get = function get(username, callback) {
  mongodb.open(function(err, db) {
    if (err) {
      return callback(err);
    }

    db.collection('tasks', function(err, collection) {
      if (err) {
        mongodb.close();
        return callback(err);
      }

      var query = {};
      if (username) {
					query.taskOwner = username;
      }

      collection.find(query).sort({updateTime: -1}).limit(20).toArray(function(err, docs) {
        mongodb.close();
        if (err) {
          callback(err, null);
        }

        var tasks= [];
        docs.forEach(function(doc, index) {

          var task = new Task(
								doc.taskWorker,
								doc.taskLevel,
								doc.taskOwner,
								doc.taskName,
								doc.taskDesc,
								doc.taskAttr,
								doc.taskStatus,
								doc.relaPname,
								doc.assigners,
								doc.img,
								doc.createTime,
								doc.updateTime,
								doc.taskDays,
								doc.taskPrice,
								doc._id);
          tasks.push(task);
        });
        callback(null, tasks);
      });
    });
  });
};


Task.getByQuery = function getByQuery(query,callback) {
  mongodb.open(function(err, db) {
    if (err) {
      return callback(err);
    }

    db.collection('tasks', function(err, collection) {
      if (err) {
        mongodb.close();
        return callback(err);
      }

      collection.find(query).sort({updateTime: -1}).limit(20).toArray(function(err, docs) {
        mongodb.close();
				//console.log('query:',docs);
        if (err) {
					console.log(err);
          callback(err, null);
        }

        var tasks = [];
        docs.forEach(function(doc, index) {
          var task = new Task(
								doc.taskWorker,
								doc.taskLevel,
								doc.taskOwner,
								doc.taskName,
								doc.taskDesc,
								doc.taskAttr,
								doc.taskStatus,
								doc.relaPname,
								doc.assigners,
								doc.img,
								doc.createTime,
								doc.updateTime,
								doc.taskDays,
								doc.taskPrice,
								doc._id);
          tasks.push(task);
        });
        callback(null, tasks);
      });
    });
  });
};
