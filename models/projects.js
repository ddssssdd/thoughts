var mongoose = require("mongoose");
var Schema = mongoose.Schema;
var ProjectSchema = new Schema({
		title:String,
		description:String,
		code:String,
		created_date:Date,
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
	debugger;
	Projects.findOne({_id:id}).exec(function(err,p){
		if (!err){
			Items.find({project:p}).exec(function(err,items){
				if (!err){
					if (callback){						
						callback(p,items);
					}
				}
			});
		}
	});
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
		created_date:Date.now()});
	item.save(function(err,raw){
		if (callback){
			callback(err,raw);
		}		
	})

}

var Projects =mongoose.model("projects",ProjectSchema);
var Items = mongoose.model("project_items",ItemSchema);
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
