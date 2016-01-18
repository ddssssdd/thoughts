var Auto_load = function(config){
	var fs = require("fs");
	
	console.log(config);
	var load_dir = function(folder){
		fs.readdir(config.base_folder + folder ,function(err,files){  //Sync does not work!	
			if (err){
				console.log(err);
				return;
			}
			for(var i=0;i<files.length;i++){
				var file = files[i];		
				if (~file.indexOf('.js')){			
					var result = require("." +folder + file);
					if (result instanceof Function){
						result(config);
					}
				}
			}
		});		
	}

	load_dir(config.models);
	load_dir(config.schedules);
}

module.exports = Auto_load;
