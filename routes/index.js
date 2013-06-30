var crypto = require('crypto');
var User = require('../models/user.js');
var Post = require('../models/post.js');
var Project = require('../models/project.js');
var Watch= require('../models/watch.js');
var Task= require('../models/task.js');
var fs= require('fs');
var url = require('url');
var ldap = require('ldapjs');
var Notify= require('../models/notify.js');

module.exports = function(app) {

	app.get('/', function(req, res) {
		

		if (!req.session.user) {
			res.render('cover', {
				title: '首页',
				layout:'coverlayout'
			});
		} else {
      res.redirect('/m/tcontext');
		}

	});

	app.get('/m/:mtype', checkLogin);
	app.get('/m/:mtype', getWathersData);
	app.get('/m/:mtype', getTasks);
	app.get('/m/:mtype', function(req, res) {

		 var tmtype = req.params.mtype;

		 var leftArgs=[],rightArgs=[];
		 if (req.body.__leftArgs != null) {
			 leftArgs=req.body.__leftArgs;
		 }
		 if (req.body.__rightArgs!= null) {
			 rightArgs=req.body.__rightArgs;
		 }
		 var __INPUT=[];
		 __INPUT.leftArgs=leftArgs;
		 __INPUT.rightArgs=rightArgs;
		 __INPUT.mywatches=rightArgs;
		 __INPUT.from=tmtype;

		 if (tmtype == 'tproject') {

			 Project.get(null, function(err, projects) {
				 if (err) {
					 projects = [];
				 }
				 __INPUT.projects=projects;
				 __INPUT.title='项目列表';
				 res.render(tmtype, {
					 __INPUT:__INPUT
				 });

			 });
		 } else if (tmtype =='tcontext') {

				Task.get(null, function(err, tasks) {
					if (err) {
						tasks= [];
					}
				 __INPUT.tasks=tasks;
				 __INPUT.title='首页';
					res.render(tmtype, {
							__INPUT:__INPUT
					});
				});
			}  else {
				 __INPUT.title=tmtype;
				 res.render(tmtype, {
					 __INPUT:__INPUT
				 });
			}

	});


	app.get('/project', checkLogin);
	app.get('/project', function(req, res) {
     res.redirect('/');
	
	});


  app.post('/new_project', checkLogin);
  app.post('/new_project', function(req, res) {
 
   
    var newProject = new Project(
      req.body.project_name,
      req.body.project_desc
    );
    

    Project.get(newProject.pname, function(err, projects) {

      if (projects.length > 0)
        err = '项目已经存在';
      if (err) {
        req.flash('error', err);
        return res.redirect('/m/tnew_project');
      }
  
      newProject.save(function(err) {
        if (err) {
          req.flash('error', err);
          return res.redirect('/m/tnew_project');
        }
        req.flash('success', '新建成功');
        res.redirect('/m/tproject');
      });
    });
  });
  

  //app.get('/reg', checkNotLogin);
	app.get('/reg', function(req, res) {

		res.render('reg', {
			title: '用户注册',
			layout: 'coverlayout'
		});
	});

  app.post('/reg', function(req, res) {
    req.session.user = null;
    if (req.body['password-repeat'] != req.body['password']) {
      req.flash('error', '两次输入的口令不一致');
      return res.redirect('/reg');
    }
  

    var md5 = crypto.createHash('md5');
    var password = md5.update(req.body.password).digest('base64');
    
    var newUser = new User({
      name: req.body.username,
      password: password
    });
    

    User.get(newUser.name, function(err, user) {
      if (user)
        err = '用户已经存在.';
      if (err) {
        req.flash('error', err);
        return res.redirect('/reg');
      }
  
      newUser.save(function(err) {
        if (err) {
          req.flash('error', err);
          return res.redirect('/reg');
        }
        req.session.user = newUser;
        req.session.project = '*';
        req.flash('success', '注册成功');
        res.redirect('/');
      });
    });
  });
  
  app.get('/login', checkNotLogin);
  app.get('/login', function(req, res) {
    res.render('login', {
      title: '用戶登入'
    });
  });
  

  app.post('/loginldap', checkNotLogin);
  app.post('/loginldap', function(req, res) {
		req.session.user = null;

    var ldappassword = req.body.password;

		if (ldappassword == "") {
			req.flash('error', '密码非空');
			return res.redirect('/');
		}
		var ldapusername='ailk\\'+req.body.username;

		var client = ldap.createClient({
			url: 'ldap://10.1.1.10:389'
		});

		client.bind(ldapusername, ldappassword , function (err) {
			  if (err) {
					req.flash('error', '不是合法用户');
					return res.redirect('/');
				}
				client.unbind();
				var md5 = crypto.createHash('md5');
				var password = md5.update(req.body.password).digest('base64');
				var newUser = new User({
					name: req.body.username,
					password: password
				});
				req.session.user = newUser;
				req.session.project = '*';
				res.redirect('/');
				/*
				var md5 = crypto.createHash('md5');

				User.get(req.body.username, function(err, user) {
					if (!user) {
						var newUser = new User({
							name: req.body.username,
							password: password,
						});

						newUser.save(function(err) {
							if (err) {
								req.flash('error', err);
								return res.redirect('/reg');
							}
							req.session.user = newUser;
							req.session.project = '*';
							res.redirect('/');
						});
					});

				}
				*/

		});
  });
 
  app.post('/login', checkNotLogin);
  app.post('/login', function(req, res) {

    var md5 = crypto.createHash('md5');
    var password = md5.update(req.body.password).digest('base64');
    
    User.get(req.body.username, function(err, user) {
      if (!user) {
        req.flash('error', '用户不存在');
        return res.redirect('/');
      }
      if (user.password != password) {
        req.flash('error', '用户口令错误');
        return res.redirect('/');
      }
      req.session.user = user;
      req.flash('success', '登入成功');
      res.redirect('/');
    });
  });
  
  app.get('/logout', checkLogin);
  app.get('/logout', function(req, res) {
    req.session.user = null;
    req.flash('success', '登出成功');
		req.body.__channel=req.query.channel;

    res.redirect('/');
  });

	app.get('/u/:user', function(req, res) {
		User.get(req.params.user, function(err, user) {
			if (!user) {
				req.flash('error', '用户不存在');
				return res.redirect('/');
			}

			Post.get(user.name, function(err, posts) {
				if (err) {
					req.flash('error', err);
					return res.redirect('/');
				}
				res.render('user', {
					title: user.name,
					posts: posts
				});
			});
		});
	});


	app.get('/p/:pname', checkLogin);
	app.get('/p/:pname', function(req, res) {

		var username = req.session.user.name;
		req.session.project = req.params.pname;
		Watch.getByPNameAndUser(req.params.pname,username, function(err, watches) {
			if (watches.length>0) {
				req.flash('error', '您已经关注过这个项目');
				return res.redirect('/m/tcontext');
			}

			var newWatch = new Watch(username,req.params.pname);
			newWatch.save(function(err) {
				if (err) {
					req.flash('error', err);
					return res.redirect('/m/tcontext');
				}
				req.flash('success', '关注成功');
				res.redirect('/m/tcontext');
			});
		});
	});

	app.get('/up/:pname', checkLogin);
	app.get('/up/:pname', function(req, res) {

		var username = req.session.user.name;
		var project = req.params.pname;
		Watch.del(username,project, function(err) {
				if (err) {
					req.flash('error', err);
					return res.redirect('/m/tproject');
				}
				req.flash('success', '取消关注关注成功');
				res.redirect('/m/tproject');
			});
	});


	/*
	app.post('/post', checkLogin);
	app.post('/post', function(req, res) {
		var currentUser = req.session.user;
		var post = new Post(currentUser.name, req.body.post,null,null,req.body.post_project_name,req.body.uploadimagenameInput);
	save(function(err) {
			if (err) {
				req.flash('error', err);
				return res.redirect('/m/tcontext');
			}
			req.flash('success', '发表成功');
			res.redirect('/m/tcontext');
		});
	});
	*/

	app.get('/mywatches', checkLogin);
	app.get('/mywatches',function(req,res) {

		Watch.getByUser(
			req.session.user.name, 
			function(err, watches) {

				res.render('mywatches', {
					title: '我的关注',
					mywatches: watches
				});
		});

	});

	app.get('/pposts/:pname', checkLogin);
	app.get('/pposts/:pname', function(req, res) {

		//var username = req.session.user.name;
		Post.getByPNameAndUser(req.params.pname,null, function(err, posts) {
			if (err) {
				req.flash('error', err);
				return res.redirect('/');
			}

			res.render('pposts', {
				title: '所有评论',
				pposts:posts,
				pname:req.params.pname
			});

		});
	});

	app.get('/pusers/:pname', checkLogin);
	app.get('/pusers/:pname', function(req, res) {

		//var username = req.session.user.name;
		Watch.getByPName(req.params.pname,function(err, watches) {
			if (err) {
				req.flash('error', err);
				return res.redirect('/');
			}

			res.render('pusers', {
				title: '项目用户',
				pusers:watches,
				pname:req.params.pname
			});

		});
	});

	app.get('/file-upload', checkLogin);
	app.get('/file-upload',function(req,res){
		var t_image_path=null;
		res.render('upload', {
				title: '文件上传',
				layout:"miniwindow"
				});
	});

	app.post('/file-upload', checkLogin);
	app.post('/file-upload',function(req,res){
		var tmp_path = req.files.image.path;
		var target_path = './public/upload/' + req.files.image.name;
		var t_target_path='/upload/'+req.files.image.name;
		fs.rename(tmp_path, target_path, function(err) {
			if (err) {
				 res.render('imclose',{
						layout:'imcloselayout',
						image_path:"ERROR"
				 });
			} else {
				fs.unlink(tmp_path, function() {
					if (err) throw err;
						res.render('imclose',{
							layout:'imcloselayout',
							image_path:t_target_path
					 });
				});
			}
		});
	});

	app.post('/postpost', checkLogin);
	app.post('/postpost', postATask);



	app.post('/new_todo', checkLogin);
	app.post('/new_todo', newTodoCheck);
	app.post('/new_todo', newTask);
	app.post('/new_todo', recieveTask);


	app.get('/recieveTask', checkLogin);
	app.get('/recieveTask', recieveTask);




	app.get('/getPnameUser', checkLogin);
	app.get('/getPnameUser', function(req, res) {

		var pname = req.query.pname;
		Watch.getByPName(pname,function(err, watches) {
			if (err) {
				req.flash('error', err);
				return res.redirect('/');
			}
			return res.json({users:watches});
		});
	});
};

function newTask(req, res,next) {

		var worker=null,level=0;
		if (req.body.todo_attr == 'toSelf'){
			worker=req.body.todo_sp;
		}

		var task = new Task(
					worker,
					level,
					req.body.todo_sp,
					req.body.todo_name,
					req.body.todo_desc,
					req.body.todo_attr,
					'open', // 新开为open
					req.body.todo_project, 
					null, // 派发给谁，先为空
					req.body.uploadimagenameInput,
					null, // 创建时间，为空 ,发生时间
					new Date(),
					req.body.todo_days,
					req.body.todo_price
					);
		task.save(function(err,tasks) {
			
			if (err) {
				req.flash('error', err);
				return res.redirect('/m/tnewTodo');
			}
			if (req.body.todo_attr == 'toOther') {
				req.body.__taskId=''+tasks[0]._id;
				req.body.__type='assign'
				req.body.__worker=req.body.todo_worker;
				next();
			} else {
				req.flash('success', '发表成功');
				res.redirect('/m/tnewTodo');
			}
		});
	}


function recieveTask(req, res, next) {
	  var taskid=null,worker=null,type=null;
	  if (req.query.task) {
			taskid = req.query.task;
			worker = req.session.user.name; 
			type = 'recieve';
		} else {
			taskid = req.body.__taskId;
			worker = req.body.__worker;
			type = req.body.__type;
		}
		console.log("loooooook  ",taskid);
		console.log("loooooook  ",worker);
		console.log("loooooook  ",type);

		Task.getById(taskid,function(err,task) {
			
			var newtask = task;
			newtask.taskWorker=worker
			newtask.taskLevel=Number(task.taskLevel)+Number(1);
			newtask.createTime= new Date();
			newtask.updateTime = newtask.createTime;
			newtask.taskAttr = type;
			newtask.assigners = ''+task.id;
			var msg='派发任务给 @'+worker;
			if (type == 'recieve') {
				 msg='认领  @' + newtask.taskOwner+ ' 的任务'
			}

			newtask.save(function(err) {

				if (err) {
					req.flash('error', err);
					return res.redirect('/m/tcontext');
				}

				/*
				var post = new Post(
										req.session.user.name,
										msg,
										newtask.taskOwner,
										null,
										newtask.relaPname,
										null,
										newtask.assigners
										);

				post.save(function(err) {
					if (err) {
						req.flash('error', err);
						return res.redirect('/m/tcontext');
					}
				});
					*/

					var sets= {};
					sets.updateTime=new Date();
					Task.update(newtask.assigners,sets,function(err) {
						if (err) {
							req.flash('error', err);
							return res.redirect('/m/tcontext');
						}

						genNewPost(msg,req.session.user.name,newtask.assigners,function(err,apost) {
							if (err) { 
								req.flash('error', err);
								return res.redirect('/m/tcontext');
							}

							genPostNotify(apost,function(err){ 
								if (err) { 
									req.flash('error', err);
									return res.redirect('/m/tcontext');
								}

								req.flash('success', '成功');
								res.redirect('/m/tcontext');
							});
						});
					});
			});
		});
}
function newTodoCheck(req, res, next) {

	if 	((req.body.todo_name == null) || 
			 (req.body.todo_name == '')) 
	{
		req.flash('error', '任务描述不能为空');
		return res.redirect('/m/tnewTodo');
	}
	next();

}



function checkLogin(req, res, next) {
	if (!req.session.user) {
		req.flash('error', '未登入');
		return res.redirect('/');
	}
	next();
}

function checkNotLogin(req, res, next) {
	if (req.session.user) {
		req.flash('error', '已登入');
		return res.redirect('/');
	}
	next();
}


function getWathersData(req, res, next) {
		Watch.getByUser(
			req.session.user.name, 
			function(err, watches) {
				req.body.__rightArgs = watches
				next();
		});
}

function getTasks(req, res, next) {
		query={};
		if (req.params.mtype == 'tcontext') {
			query.taskWorker = req.session.user.name;
		} else if (req.params.mtype == 'tnewTodo') {
			query.taskOwner = req.session.user.name;
			query.assigners = null;
		} else {
			query.taskOwner = req.session.user.name;
		}

		Task.getByQuery(
			query,
			function(err, tasks) {
				req.body.__leftArgs= tasks ;
			 	next();
		});
}

function genPostNotify(newpost,callback) {
			var notify = new Notify(
						newpost.user,
						newpost.post_to,
						'p2p',
						'email',
						newpost.post,
						'new',
						null,
						null,
						null);

			notify.save(function(err, notifys) {
				 if (err) {
					 return callback(err);
				 }

				 callback(null);
			});
}

function postErr() {
		var posts = [];
		req.flash('error', '任务已经被删除');
		return res.render('getPostPost',{
			layout:'getPostPostLayout',
			posts:posts
		});
}


function postATask(req,res,next) {

	  console.log("--------------------------",req.body);

		var postposttxt = req.body.postTxt;
		if (postposttxt == null || postposttxt == "" ) {
			Post.getSubPost(req.body.task_id,function(err,posts) {
				if (err) { return postErr();}

				res.render('getPostPost',{
					layout:'getPostPostLayout',
					posts:posts
				});
			});
		}  else {
			console.log('==========');
			genNewPost(postposttxt,req.session.user.name,req.body.task_id,function(err,apost) {
				if (err) { return postErr();}
				console.log(apost);

				genPostNotify(apost,function(err){ 
					if (err) { return postErr();}

					console.log(apost);
					Post.getSubPost(req.body.task_id,function(err,posts) {
						if (err) { return postErr();}

						res.render('getPostPost',{
							layout:'getPostPostLayout',
							posts:posts
						});
					});
				});
			});
	 }
}

function genNewPost(posttxt,who,task_id,callback) {

		Task.getById(''+task_id,function(err,task) {
			if (err) {
				return callback(err);
			}
			var post = new Post(
							who,
							posttxt,
							task.taskOwner,
							null,
							task.relaPname,
							null,
							''+task_id,
							null);

				post.save(function(err,posts) {
					if (err) {
						return callback(err);
					}
					return callback(null,posts[0]);
				});
		});

}
