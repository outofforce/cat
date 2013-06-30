var mysql=require('mysql');
var DbConn= mysql.createConnection({
	  host	:	'127.0.0.1',
		user	:	'cat',
		password	:	'aopen7291',
		database :	'cat'
});

module.exports = DbConn;
