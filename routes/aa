var crypto = require('crypto');
var User = require('../models/user.js');
var Post = require('../models/post.js');
var Project = require('../models/project.js');
var Watch= require('../models/watch.js');
var fs= require('fs');
var url = require('url');


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

	app.get('/m/:mtype', function(req, res) {

		 var tmtype = req.params.mtype;

		 console.log('============',tmtype);
		 Watch.getByUser(req.session.user.name, function(err, watches) {

			 console.log('req.session=', req.session);

			 if (tmtype == 'tproject') {

				 Project.get(null, function(err, projects) {
					 if (err) {
						 projects = [];
					 }
					 res.render(tmtype, {
						 title: '项目列表',
						 from:'project',
						 projects:projects,
						 mywatches:watches,
					 });

				 });
			 } else if (tmtype =='tcontext') {

					Post.get(null, function(err, posts) {
					//console.log('============',posts);
					//console.log('============',watches);
						if (err) {
							posts = [];
						}
						res.render(tmtype, {
								title: '首页',
								from:tmtype,
								posts:posts,
								mywatches:watches,
						});
					});
			  }  else {
					 res.render(tmtype, {
						 title: tmtype,
						 from:tmtype,
						 mywatches:watches,
					 });
				}

			});
	});


	app.get('/project', checkLogin);
	app.get('/project', function(req, res) {
		 //req.session.asfrom="project";
     res.redirect('/');
	
	});

  app.get('/new_project', checkLogin);
	app.get('/new_project', function(req, res) {
		res.render('index', {
			title: '新建项目',
			from:'new_project',
		});
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
        return res.redirect('/new_project');
      }
  
      newProject.save(function(err) {
        if (err) {
          req.flash('error', err);
          return res.redirect('/new_project');
        }
        req.flash('success', '新建成功');
        res.redirect('/project');
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

  app.post('/reg', checkNotLogin);
  app.post('/reg', function(req, res) {
 
    if (req.body['password-repeat'] != req.body['password']) {
      req.flash('error', '两次输入的口令不一致');
      return res.redirect('/reg');
    }
  

    var md5 = crypto.createHash('md5');
    var password = md5.update(req.body.password).digest('base64');
    
    var newUser = new User({
      name: req.body.username,
      password: password,
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
      title: '用戶登入',
    });
  });
  
  app.post('/login', checkNotLogin);
  app.post('/login', function(req, res) {

    var md5 = crypto.createHash('md5');
    var password = md5.update(req.body.password).digest('base64');
    
    User.get(req.body.username, function(err, user) {
      if (!user) {
        req.flash('error', '用户不存在');
        return res.redirect('/login');
      }
      if (user.password != password) {
        req.flash('error', '用户口令错误');
        return res.redirect('/login');
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
					posts: posts,
				});
			});
		});
	});


	app.get('/p/:pname', checkLogin);
	app.get('/p/:pname', function(req, res) {

		var username = req.session.user.name;
		req.session.project = req.params.pname;
		console.log('PPP:',req.session.project);
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


	app.post('/post', checkLogin);
	app.post('/post', function(req, res) {
		var currentUser = req.session.user;
		var post = new Post(currentUser.name, req.body.post,null,req.body.post_project_name,req.body.uploadimagenameInput);
		post.save(function(err) {
			if (err) {
				req.flash('error', err);
				return res.redirect('/m/tcontext');
			}
			req.flash('success', '发表成功');
			res.redirect('/m/tcontext');
		});
	});

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
				pname:req.params.pname,
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
				pname:req.params.pname,
			});

		});
	});

	app.get('/file-upload',function(req,res){
		var t_image_path=null;
		res.render('upload', {
				title: '文件上传',
				layout:"miniwindow",
				});
	});

	app.post('/file-upload',function(req,res){
		console.log(req.files.image);
		var tmp_path = req.files.image.path;
		var target_path = './public/upload/' + req.files.image.name;
		var t_target_path='/upload/'+req.files.image.name;
		fs.rename(tmp_path, target_path, function(err) {
			if (err) {
				 res.render('imclose',{
						layout:'imcloselayout',
						image_path:"ERROR",
				 });
			} else {
				fs.unlink(tmp_path, function() {
					if (err) throw err;
						res.render('imclose',{
							layout:'imcloselayout',
							image_path:t_target_path,
					 });
				});
			}
		});
	});



};



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
				req.session.mywatches= watches
				next();
		});

}



