module.exports = function(req,res,model_name,parameter,populate,sort){
	var m = require("mongoose");
	var Model = m.model(model_name);
	parameter = parameter || {};	
	page = parseInt( req.params.index || req.body.index || 1 );
	size = parseInt( req.params.size || req.body.size || 10 );
	var query = Model.find(parameter).lean()		
		.skip((page-1)*size)
		.limit(size);
	if (sort){
		query.sort(sort);
	}
	if (populate){
		query.populate(populate);
	}
	query.exec(function(err,items){
		res.json({status: err?false:true,result:items,pagination:{index:page,size:size}});
	});
}