var mongoose = require("mongoose");
var Schema = mongoose.Schema;
var ProjectSchema = new Schema({
		title:String,
		description:String,
		code:String,
		created_date:Date,
		updated_date:Date,
		user:{
			type:Schema.ObjectId,
			ref:"users"
		}
	});

//instance
ProjectSchema.methods.findByUser = function(user_id,callback){
	
	return this.model("projects").find({user:user_id}).populate("user").exec(callback);
}
//static 
ProjectSchema.statics.findByCode = function(code,callback){
	
	return this.find({code:code}).populate("user").exec(callback);
}

ProjectSchema.statics.info = function(id,callback){
	
	Projects.findOne({_id:id}).exec(function(err,p){
		if (!err){
			Items.find({project:p}).populate("user").exec(function(err,items){
				if (!err){
					if (callback){						
						callback(p,items);
					}
				}
			});
		}
	});
}
ProjectSchema.statics.current_code = function(p_id,callback){
	Issue.count({project:p_id}).exec(function(err,data){
		if (!err){
			callback((data+1)+'');	
		}else{
			callback('');
		}	
		
	});
	/*
	Projects.findOne({_id:p_id}).exec(function(err,p){
		if (!err){
			Issue.count({project:p}).exec(function(err,data){
				if (!err){
					callback(p.code.trim()+'-'+(data+1));	
				}else{
					callback('');
				}	
				
			})
		}else{
			callback('');
		}
	});
	*/
}

//virtual 
ProjectSchema.virtual("detail").get(function(){
	return this.title +"("+ this.code + ")"+" -- " + this.description;
});
ProjectSchema.virtual("detail").set(function(value){
	this.title = value;
	console.log(this);
});


ProjectSchema.pre("save",function(next,done){
	//console.log("Before saving projects:")
	//console.log(this);
	this.created_date = Date.now();
	next();
});
ProjectSchema.post("save",function(doc){
	console.log(doc);
});

var ItemSchema = new Schema({
	project:{
		type:Schema.ObjectId,
		ref:"projects"
	},
	title:String,
	description:String,
	created_date:Date,
	updated_date:Date,
	index:Number,	
	user:{
		type:Schema.ObjectId,
		ref:"users"
	}
});
ItemSchema.statics.add = function(project,user,title,description,index,callback){	
	var  item = new Items({
		project:project,
		user:user,
		title:title,
		description:description,
		index:index || 1,
		updated_date:Date.now(),
		created_date:Date.now()});
	item.save(function(err,raw){
		if (callback){
			callback(err,raw);
		}		
	})

}
var IssueSchema = new Schema({
	project:{
		ref:"projects",
		type:Schema.ObjectId
	},
	owner:[],
	title:String,
	description:String,
	status:String,
	bref:String,
	created_date:Date,
	updated_date:Date,
	user:{
		type:Schema.ObjectId,
		ref:'users'
	}
});

IssueSchema.statics.add = function(project_id,owner,title,description,status,user_id,callback){
	Projects.current_code(project_id,function(bref){
		var issue = {
			project:project_id,
			owner:[owner],
			title:title,
			description:description,
			status:status,
			bref:bref,
			created_date:Date.now(),
			user:user_id
		}
		callback = callback || function(arr){};
		new Issue(issue).save(function(err,raw){
			if (!err){
				Issue.findIssues(owner,callback);
			}else{
				callback([]);
			}
		});
	})
	
}
IssueSchema.statics.findIssues =  function(owner,callback){
	callback = callback || function(arr){};
	Issue.find({owner:{$in:[owner]}).populate("project").exec(function(err,data){
		if(!err){
			callback(data);
		}else{
			callback([]);
		}
	});
}
IssueSchema.statics.findIssueByCode = function(code,bref,callback){
	Projects.findOne({code:code}).exec(function(err,p){
		if (!err){
			Issue.findOne({bref:bref,project:p}).exec(function(err,issue){
				if (!err){
					callback(issue);
				}else{
					callback(null);
				}
			});
		}else{
			callback(null);
		}
	})
}

var Projects =mongoose.model("projects",ProjectSchema);
var Items = mongoose.model("project_items",ItemSchema);
var Issue = mongoose.model("project_issues",IssueSchema);
module.exports = Projects;
console.log("Register projects,project_items success!");


/*

var schema = new Schema({
  name:    String,
  binary:  Buffer,
  living:  Boolean,
  updated: { type: Date, default: Date.now }
  age:     { type: Number, min: 18, max: 65 }
  mixed:   Schema.Types.Mixed,
  _someId: Schema.Types.ObjectId,
  array:      [],
  ofString:   [String],
  ofNumber:   [Number],
  ofDates:    [Date],
  ofBuffer:   [Buffer],
  ofBoolean:  [Boolean],
  ofMixed:    [Schema.Types.Mixed],
  ofObjectId: [Schema.Types.ObjectId],
  nested: {
    stuff: { type: String, lowercase: true, trim: true }
  }
})
// example use
var Thing = mongoose.model('Thing', schema);
var m = new Thing;
m.name = 'Statue of Liberty'
m.age = 125;
m.updated = new Date;
m.binary = new Buffer(0);
m.living = false;
m.mixed = { any: { thing: 'i want' } };
m.markModified('mixed');
m._someId = new mongoose.Types.ObjectId;
m.array.push(1);
m.ofString.push("strings!");
m.ofNumber.unshift(1,2,3,4);
m.ofDate.addToSet(new Date);
m.ofBuffer.pop();
m.ofMixed = [1, [], 'three', { four: 5 }];
m.nested.stuff = 'good';
m.save(callback);


*/
