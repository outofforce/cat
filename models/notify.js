var mongodb = require('./db');
var ObjectID= require('mongodb').ObjectID;

function Notify(notifySourcer,notifyReciever,notifyType,notifyChannel,notifyContext,notifyStatus,createTime,updateTime,id) {

  this.notifySourcer= notifySourcer;
  this.notifyReciever= notifyReciever;
  this.notifyType= notifyType;
  this.notifyChannel= notifyChannel;
  this.notifyContext= notifyContext;
  this.notifyStatus= notifyStatus;

	
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
	if (id)
		this.id=id;
	
};

module.exports = Notify;

Notify.prototype.save = function save(callback) {
  var notify= {
		notifySourcer: this.notifySourcer,
    notifyReciever: this.notifyReciever,
    notifyType: this.notifyType,
    notifyChannel: this.notifyChannel,
		notifyContext: this.notifyContext,
		notifyStatus: this.notifyStatus,
    createTime: this.createTime,
    updateTime: this.updateTime,
  };

  mongodb.open(function(err, db) {
    if (err) {
      return callback(err);
    }
    db.collection('notifys', function(err, collection) {
      if (err) {
        mongodb.close();
        return callback(err);
      }
      collection.ensureIndex('notifySourcer');
      collection.ensureIndex('notifyReciever');
			
      collection.insert(notify, {safe: true}, function(err, notifys) {
				if (err) {
					mongodb.close();
					return callback(err);
				}
				mongodb.close();
				callback(err,notifys);
      });
    });
  });
};

Notify.update = function update(id,sets, callback) {
	mongodb.open(function(err, db) {
    if (err) {
      return callback(err);
    }

    db.collection('notifys', function(err, collection) {
      if (err) {
        mongodb.close();
        return callback(err);
      }
			//console.log('id',id);
			//console.log('set',sets);

			collection.update({_id:new ObjectID(''+id)},{$set:sets},{safe:true},function(err) {
				mongodb.close();
				if (err)
					console.log(err);
				callback(err);
			});
		});
  });
};


Notify.getById= function getById(id, callback) {
	mongodb.open(function(err, db) {
    if (err) {
      return callback(err);
    }

    db.collection('notifys', function(err, collection) {
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
        var notify = new Notify(
								doc.notifySourcer,
								doc.notifyReciever,
								doc.notifyType,
								doc.notifyChannel,
								doc.notifyContext,
								doc.notifyStatus,
								doc.createTime,
								doc.updateTime,
								doc._id);
        callback(null, notify);

      });
		});
  });
};



Notify.getByQuery = function getByQuery(query,callback) {
  mongodb.open(function(err, db) {
    if (err) {
      return callback(err);
    }

    db.collection('notifys', function(err, collection) {
      if (err) {
        mongodb.close();
        return callback(err);
      }

      collection.find(query).sort({updateTime: -1}).limit(100).toArray(function(err, docs) {
        mongodb.close();
        if (err) {
          callback(err, null);
        }

        var notifys= [];
        docs.forEach(function(doc, index) {
					var notify = new Notify(
							doc.notifySourcer,
							doc.notifyReciever,
							doc.notifyType,
							doc.notifyChannel,
							doc.notifyContext,
							doc.notifyStatus,
							doc.createTime,
							doc.updateTime,
							doc._id);

          notifys.push(notify);
        });
        callback(null, notifys);
      });
    });
  });
};
