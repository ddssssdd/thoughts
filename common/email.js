var nodemailer = require("nodemailer");
var config = require("../config");
var transporter = nodemailer.createTransport(config.email.smtp);

/*
example:
	1. var email = {to:"a060116@163.com",subject:"subject",html:"test",attachments:[]};
	require("../common/email").send_and_call(req.session.user,email,function(err,info){
		res.json(info);
	});
	2. var att = [{filename:'text1.txt',content:'this is attachment'},{path:"/Users/stevenfu/Pictures/0824ab18972bd407ce1502f479899e510eb309ed.jpg"}];
	require("../common/email").send(req.session.user,"a060116@163.com","another test newvsssvvs saad","this is body");
	res.end("Send!");
*/
module.exports = {
	send:function(user,to,subject,body,attachment){
		var mail= {
			from:config.email.from,
			to:to,//"a060116@163.com,fuxinyu@gmail.com",
			subject: subject || "From Thoughts",//"this is test email.",
			text:"this is body",
			html:body || '',//'<b>this should be bold font</b>',
			attachments:attachment || []
		};
		transporter.sendMail(mail,function(err,info){
			if (err){
				console.log(err);
				//res.json(err);
				return;
			}
			//console.log(info);
			//res.json(info);
			if (config.email.log)
				require("mongoose").model("user_logs").log(user,JSON.stringify(mail),null);
		});
	},
	send_and_call : function(user,email,callback){
		email.from = email.from || config.email.from;
		transporter.sendMail(email,function(err,info){
			if (callback)
				callback(err,info);
			if (config.email.log && !err && user)
				require("mongoose").model("user_logs").log(user,JSON.stringify(email),null);
		});
	},
	send_and_sure :function(email,callback){ // try in 3 times, send fail email to admin if  3 tries.
		
		var that = this;
		var execute_count = 0;
		var execute = function(){
			console.log("Execute send email at "+(execute_count+1));
			that.send_and_call(null,email,function(err,info){
				if (err){
					console.log(err);
					if (execute_count>=2){
						callback("execute 3 time, but all failed.",null);
						that.send_alert("Send email to "+email.to +" failed in 3 times, content:"+JSON.stringify(email)+", error message: "+ JSON.stringify(err));
					}else{
						execute_count ++;
						setTimeout(execute,3000);
					}
				}else{
					callback(err,info);
				}
			});
		}
		execute();

	},
	send_alert : function(message){ // send this message to admin user.
		var email = {to:config.email.admin_email,subject:"Something happened.",html:message};
		this.send_and_call(null,email);
	}
}


/*****
attachments: [
        {   // utf-8 string as an attachment
            filename: 'text1.txt',
            content: 'hello world!'
        },
        {   // binary buffer as an attachment
            filename: 'text2.txt',
            content: new Buffer('hello world!','utf-8')
        },
        {   // file on disk as an attachment
            filename: 'text3.txt',
            path: '/path/to/file.txt' // stream this file
        },
        {   // filename and content type is derived from path
            path: '/path/to/file.txt'
        },
        {   // stream as an attachment
            filename: 'text4.txt',
            content: fs.createReadStream('file.txt')
        },
        {   // define custom content type for the attachment
            filename: 'text.bin',
            content: 'hello world!',
            contentType: 'text/plain'
        },
        {   // use URL as an attachment
            filename: 'license.txt',
            path: 'https://raw.github.com/nodemailer/nodemailer/master/LICENSE'
        },
        {   // encoded string as an attachment
            filename: 'text1.txt',
            content: 'aGVsbG8gd29ybGQh',
            encoding: 'base64'
        },
        {   // data uri as an attachment
            path: 'data:text/plain;base64,aGVsbG8gd29ybGQ='
        }
    ]





*****/