var Reader = function(config){
	var schedule = require('node-schedule');
  	console.log("Scheduling to auto fetch news at "+ Date.now().toString());

  	var rule = new schedule.RecurrenceRule();
  	rule.minute = 1;
  	//rule.second = 25;
  	//var j = schedule.scheduleJob("/15 * * * * *", function(){  
  	var j = schedule.scheduleJob(rule, function(){  
      require("../common/spider").update_feeds(function(results){
        //nothing;
      });
  	});
}

module.exports = Reader;