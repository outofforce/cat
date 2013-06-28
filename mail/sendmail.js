var fs= require('fs');
var Notify= require('../models/notify.js');
var EventEmitter= require('events').EventEmitter;
var mail_handle = new EventEmitter();
var nodemailer = require("nodemailer");
 



var wait = function(mils) {
	    var now = new Date;
			    while(new Date - now <= mils);
};


mail_handle.on("begin",function sendNotifyMail() {

	console.log("sendNotifyMail start....");
	
  var counter = 0;
	var NotifySet=[]; 
	var query={};
	query.notifyStatus='new';


	Notify.getByQuery(query,function(err,notifys) {
		if (err) {
			console.log(err);
			return err;
		}
		if (notifys.length == 0) { 
			//wait(1000*30);
	  	console.log("sendNotifyMail no data wait 1s..");
			setTimeout(beginDoMail, 5000);
			//mail_handle.emit('begin');
			return ;
		}
		var smtpTransport = nodemailer.createTransport("SMTP",{
			host: "mail.asiainfo-linkage.com",
				auth: {
					user: "cuoss",
				pass: "mcc#xl224"
				}
		});

		var cFunc = function (i,len) {
			if (i<len) {
				var t = notifys[i].notifyReciever+'@asiainfo-linkage.com';
				var s = 'cat 提醒你，有人给你评论';
				var pt = notifys[i].notifyContext;
				var ht = "<b>"+notifys[i].notifyContext+"</b>";
				var mailOptions = {
					from: "<cuoss@asiainfo-linkage.com>",
					to: t,
					subject:s,
					text: pt,
					html: ht 
				}
				var id = ''+notifys[i].id;

				i++;

				smtpTransport.sendMail(mailOptions, function(error, response){

					var sets={};
					sets.notifyStatus='fin'
					if (error) {
						console.log('error...',error);
						sets.notifyStatus='fail'
					} else {
						console.log('response....',response.message);
					}	

						Notify.update(''+id,sets,function(err) {
							if (err)
							console.log(err);
						cFunc(i,len)
						});
					});

			} else {
				smtpTransport.close(); 
				mail_handle.emit('begin');
			}
		}

		cFunc(0,notifys.length);


			/*
			var t = notify.notifyReciever+'@asiainfo-linkage.com';
			var s = 'cat 提醒你，有人给你评论';
			var pt = notify.notifyContext;
			var ht = "<b>"+notify.notifyContext+"</b>";

			

			var mailOptions = {
					from: "<cuoss@asiainfo-linkage.com>",
					to: t,
					subject:s,
					text: pt,
					html: ht 
			}

			smtpTransport.sendMail(mailOptions, function(error, response){

				smtpTransport.close(); 
				var sets={};
				sets.notifyStatus='fin'
				if (error) {
					console.log(error);
					sets.notifyStatus='fail'
				} else {
					console.log(response);
				}	

				Notify.update(''+notify.id,sets,function(err) {
						if (err)
							console.log(err);

						mail_handle.emit('begin');
				});

			});
			*/
	});
});


function beginDoMail() {
		mail_handle.emit('begin');
};

beginDoMail();


