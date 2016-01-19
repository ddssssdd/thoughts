var Remove_temp = function(config){
  var schedule = require('node-schedule');

  //https://github.com/node-schedule/node-schedule/blob/master/README.md

  /* Date-based Scheduling
  var date = new Date(2012, 11, 21, 5, 30, 0);

  var j = schedule.scheduleJob(date, function(){
    console.log('The world is going to end today.');
  });


  j.cancel();
  */

  
  //var temppath = __dirname +"\\..\\uploads\\temp\\";
  var temppath = config.base_folder + config.uploads.temp;

  console.log("Begin setup schedule to clear temp folder: " + temppath);

  var rule = new schedule.RecurrenceRule();
  rule.second = 20;
  var delete_files =[];
  var j = schedule.scheduleJob(rule, function(){  
    console.log("Begin recording the temp folder");
      var fs = require("fs");
      
      fs.readdir(temppath,function(err,files){
        delete_files =[];
        for(var i =0;i<files.length;i++){
          var file = files[i];
          delete_files.push(file);        
        }
      })
  });
  var rule2 = new schedule.RecurrenceRule();
  rule2.second = 30;
  schedule.scheduleJob(rule2,function(){
    console.log("Begin cleaning the temp folder");
    for(var i=0;i<delete_files.length;i++){
      var file = delete_files[i];
      console.log("cleaning ... "+file);
      var fs = require("fs");
        fs.unlink(temppath+file,function(err){
          if (err){
            console.log(err);
          }
        });
    }
  });
}
module.exports = Remove_temp;
