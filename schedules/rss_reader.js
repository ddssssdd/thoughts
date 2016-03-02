var Reader = function(config){
	var schedule = require('node-schedule');
  	console.log("Scheduling to auto fetch news at "+ Date.now());

  	var rule = new schedule.RecurrenceRule();
  	//rule.minute = 1;
  	rule.second = 30;
  	var j = schedule.scheduleJob("* /5 * * * *", function(){  
    	var m = require("mongoose");
    	var Site = m.model("feed_sites");
    	Site.sites(function(err,sites){
    		if (sites && sites.length>0){
    			sites.forEach(function(site){
    				console.log("Begin fetch "+ site.url)
    				var parser = require("rss-parser");
    				parser.parseURL(site.url,function(err,result){
    					result.feed.entries.forEach(function(entry){
    						console.log(entry);
    						Site.feed(site,entry);
    					});
    				});
    			})
    		}
    	})
  	});
}

module.exports = Reader;