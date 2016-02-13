var express = require("express");
var router = express.Router();
var Bing = require("node-bing-api")({accKey:"f5Jjmx7eh64/ad68KAWg0V0aelGm/8dKYPNoABzHy3M"});
router.get("/search/:key",function(req,res){
	var page = req.query.page | 1;
	Bing.web(req.params.key,{top:50,skip:(page-1)*50},function(error,res_bing,body){
		if (!error){
			console.log(body);
			res.json(body.d.results);
			return;
		}
		res.redirect("/bing/index");
	});
});
router.get("/image/:key",function(req,res){
	var page = req.query.page | 1;
	Bing.images(req.params.key, {
		top:50,
		skip:(page-1)*50,
	    imageFilters: {
	      size: 'small',
	      color: 'monochrome'
	    }
	  }, function(error, res_bing, body){
	  	console.log(body);
	  	res.json(body.d.results);
	  });

});
/*
router.get("/test/:name",function(req,res){
	res.json({params:req.params,query:req.query});
});
*/
module.exports = router;


/*
Composite Search:

Bing.composite("xbox", {
    top: 10,  // Number of results (max 15 for news, max 50 if other)
    skip: 3,   // Skip first 3 results
    sources: "web+news", //Choises are web+image+video+news+spell
    newsSortBy: "Date" //Choices are Date, Relevance
  }, function(error, res, body){
    console.log(body);
  });
News Search:

Bing.news("xbox", {
    top: 10,  // Number of results (max 15)
    skip: 3,   // Skip first 3 results
    newsSortBy: "Date", //Choices are: Date, Relevance
    newsCategory: "rt_Business" // Choices are:
                                //   rt_Business
                                //   rt_Entertainment
                                //   rt_Health
                                //   rt_Politics
                                //   rt_Sports
                                //   rt_US
                                //   rt_World
                                //   rt_ScienceAndTechnology
    newsLocationOverride: "US.WA" // Only for en-US market
  }, function(error, res, body){
    console.log(body);
  });
Video Search:

Bing.video("monkey vs frog", {
    top: 10,  // Number of results (max 50)
    skip: 3,   // Skip first 3 result
    videoFilters: {
      duration: 'short',
      resolution: 'high'
    },
    videoSortBy: 'Date' // Choices are:
                        //   Date
                        //   Relevance
  }, function(error, res, body){
    console.log(body);
  });
Images Search:

Bing.images("Ninja Turtles", {skip: 50}, function(error, res, body){
  console.log(body);
});
Adding filter(s) for the Image Search

Bing.images("Ninja Turtles", {
    imageFilters: {
      size: 'small',
      color: 'monochrome'
    }
  }, function(error, res, body){
  console.log(body);
  });
Accepted filter values:

Size:<Small | Medium | Large>
Size:Height:<Height>
Size:Width:<Width>
Aspect:<Square | Wide | Tall>
Color:<Color | Monochrome>
Style:<Photo | Graphics>
Face:<Face | Portrait | Other>
Related Search:

Bing.relatedSearch('berlin', {market: 'en-US'}, function (err, res, body) {
  var suggestions = body.d.results.map(function(r){ return r.Title; });
  console.log(suggestions.join('\n'));
});
Spelling Suggestions:

Bing.spelling('awsome spell', function (err, res, body) {
  console.log(body.d.results[0]); //awesome spell
});
Specify Market

Getting spanish results:

Bing.images("Ninja Turtles"
          , {top: 5, market: 'es-ES'}
          , function(error, res, body){

  console.log(body);
});
List of Bing Markets

Adult Filter

Bing.images('Kim Kardashian'
          , {market: 'en-US', adult: 'Strict'}
          , function(error, res, body){

  console.log(body.d.results);
});
Accepted values: "Off", "Moderate", "Strict".

Moderate level should not include results with sexually explicit images or videos, but may include sexually explicit text.
















*/