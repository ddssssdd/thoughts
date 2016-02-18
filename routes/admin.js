var express = require("express");
var router = express.Router();

function RunCmd(cmd, args, cb, end) {
    var spawn = require('child_process').spawn,
        child = spawn(cmd, args),
        me = this;
    child.stdout.on('data', function (buffer) { cb(me, buffer) });
    child.stdout.on('end', end);
}
router.get("/backup",function(req,res){
 	var backup =new RunCmd(
 		'mongodump',//'mongodump',
 		['/d', 'thoughts', '/gzip', '/excludeCollectionsWithPrefix:book','/archive:db_backup.zip'],
 		function(me,buffer){ me.stdout += (buffer || 'nothing').toString()},
 		function(){
 			console.log(backup.stdout);
 			if (backup.stdout){
 				res.json(backup.stdout.split("\n"));	
 			}else{
 				res.json({status:false,message:'something wrong'});
 			}
 			
 		}
 	)
});
router.get("/restore",function(req,res){
 	var backup =new RunCmd(
 		'mongorestore',//'mongodump',
 		['/d', 'thoughts', '/gzip', '/archive:db_backup.zip','/drop'],
 		function(me,buffer){ me.stdout +=(buffer || 'nothing').toString()},
 		function(){
 			console.log(backup.stdout);
 			if (backup.stdout){
 				res.json(backup.stdout.split("\n"));	
 			}else{
 				res.json({status:false,message:'something wrong'});
 			}
 			
 		}
 	)
});
router.get("/git/:command",function(req,res){
 	var backup =new RunCmd(
 		'git',//'mongodump',
 		[req.params.command],
 		function(me,buffer){ me.stdout +=(buffer || 'nothing').toString()},
 		function(){
 			console.log(backup.stdout);
 			if (backup.stdout){
 				res.json(backup.stdout.split("\n"));	
 			}else{
 				res.json({status:false,message:'something wrong'});
 			}
 			
 		}
 	)
});

module.exports = router;