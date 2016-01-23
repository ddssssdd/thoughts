var nodemailer = require("nodemailer");
var config = require("../config");
var transporter = nodemailer.createTransport(config.email.smtp);


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
				require("mongoose").model("user_logs").log(user,JSON.stringify(info),null);
		});
	},
	send_and_call : function(user,email,callback){
		email.from = config.email.from;
		transporter.sendMail(email,function(err,info){
			if (callback)
				callback(err,info)
		});
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