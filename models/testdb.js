var mysql=require('mysql');
var conn= mysql.createConnection({
	  host	:	'127.0.0.1',
		user	:	'cat',
		password	:	'aopen7291',
		database :	'cat'
});


function Project(name,desc) {
  this.name = name;
  this.desc= desc;
};


conn.connect(function(err){
	if (err) {
		conn.end();
		console.log(err);
	}
});

conn.query('select * from project',function(err,results){
	if (err) {
		conn.end();
		console.log(err);
	}
	var projects=[];
	results.forEach(function(doc, index) {
		var project= new Project(doc.name, doc.desc);
		projects.push(project);
	});
	console.log(projects);
});
conn.query('select * from project',function(err,results){
	if (err) {
		conn.end();
		console.log(err);
	}
	var projects=[];
	results.forEach(function(doc, index) {
		var project= new Project(doc.name, doc.desc);
		projects.push(project);
	});
	console.log(projects);
});


conn.end();
