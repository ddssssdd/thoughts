angular.module('commonService', []).config(function($httpProvider){
 $httpProvider.interceptors.push('StatusInterceptor');
});

angular.module("commonService",["ngMd5"], function($httpProvider) { //fix angular default post method
	  // Use x-www-form-urlencoded Content-Type
	  $httpProvider.defaults.headers.post['Content-Type'] = 'application/x-www-form-urlencoded;charset=utf-8';
	  $httpProvider.defaults.headers.put['Content-Type'] = 'application/x-www-form-urlencoded;charset=utf-8';
	 

	  var param = function(obj) {
	    var query = '', name, value, fullSubName, subName, subValue, innerObj, i;
	      
	    for(name in obj) {
	      value = obj[name];
	        
	      if(value instanceof Array) {
	        for(i=0; i<value.length;i++){
	          subValue = value[i];
	          fullSubName = name + '[' + i + ']';
	          innerObj = {};
	          innerObj[fullSubName] = subValue;
	          query += param(innerObj) + '&';
	        }
	      }
	      else if(value instanceof Object) {
	        for(subName in value) {
	          subValue = value[subName];
	          fullSubName = name + '[' + subName + ']';
	          innerObj = {};
	          innerObj[fullSubName] = subValue;
	          query += param(innerObj) + '&';
	        }
	      }
	      else if(value !== undefined && value !== null)
	        query += encodeURIComponent(name) + '=' + encodeURIComponent(value) + '&';
	    }
	      
	    return query.length ? query.substr(0, query.length - 1) : query;
	  };
	 
	  // Override $http service's default transformRequest
	  $httpProvider.defaults.transformRequest = [function(data) {
	    return angular.isObject(data) && String(data) !== '[object File]' ? param(data) : data;
	  }];
	})
.factory("Message",function(){
	return {
		show:function(message){
			layer.alert(message);
		},
		loading:function(){
			return layer.load();
		},
		close:function(handler){
			layer.close(handler);
		},
		closeAll:function(){
			layer.closeAll();
		},
		confirm:function(message,btn1,btn2,callback1,callback2){
			btn1 = btn1 || "Cacel";
			btn2 = btn2 || "OK";
			var index = layer.confirm(message,{btn:[btn1,btn2]},function(){
				layer.close(index);
				if (callback1) callback1();
			},function(){
				layer.close(index);
				if (callback2) callback2();
			});
		},
		msg:function(message){
			layer.msg(message);
		},
		input:function(message,callback){
			layer.prompt({title:message,formType:1},function(result){
				if (callback) callback(result);
			})
		}
	}
})
.factory("logger",function(){ // log wrapper
	return {
		log:function(msg){
			console.log(msg);
		}
	}
})
.factory("httpService",function($http,logger,md5,Message){//use this will cache the result and return cache result first.
	var Post = function(url,parameter,success,immediate,showStatus){
		this.url = url;
		this.parameter = parameter;
		var cacheKey =md5.createHash(url+JSON.stringify(parameter));
		try{
			var cache = localStorage.getItem(cacheKey);
			if (cache){
				this.result =(JSON.parse(cache));
				if (immediate){
					immediate(this.result);
				}/*else if (success){
					success(this.result);
				}*/
				//logger.log("Get ["+url+"] from cache");
			}	
		}catch(error){
			logger.log("Failed to get value from localstorage. Error: "+error);
		}
		var handler = Message.loading();
		$http.post(url,parameter).success(function(json){
			Message.close(handler);
			try{
				localStorage.setItem(cacheKey,(JSON.stringify(json)));	
				logger.log("http post: "+ url );
				/*
				logger.log("Write ["+url+"] result to cache");
				logger.log("Parameters:");
				logger.log(parameter);
				logger.log("Return:");
				logger.log(json);
				*/
			}catch(error){
				localStorage.clear();
				logger.log("Failed to write value to localstorage. Error: "+error);
			}
			if (success){
				success(json);
			}
			
		}).error(function(err){
			Message.close(handler);
			
			Message.msg(err);
		});
	}
	return Post;
})
.factory("UserService",function(httpService){
	console.log("Init UserService in commonService");
	var user = null;
	var is_login = false;
	
	var process_result = function(json){
		if (json.status){
			is_login = true;
			user = json.result;
		}else{
			is_login = false;
			user = null;
		}
		console.log(json);
	}
	var url ="/users/info";
	httpService(url,{},process_result,process_result);
	
	return {
		user:function(){
			return user;
		},
		is_login :function(){
			return is_login;
		}
	}
	
})
.filter("timeFormat",function(){
	return function(d){
		return timeDifference(Date.now(),Date.parse(d));
	}
})
.service("Pagination",function(httpService){
	var Pagination = function(url,parameter,callback){
		var self = this;
		this.url = url;
		this.results = [];
		this.parameter = parameter || {};
		this.pageSize = 20;
		this.pagination = {index:0, loading:false, has_next:true};
		this.callback = callback;
		this.scroll_on_elelment = false;
		this.load_data = function(){
			if (self.pagination.loading){
				return;
			}
			if (!self.pagination.has_next){
				return;
			}
			self.pagination.index ++;
			self.pagination.loading = true;
			self.parameter.index = self.pagination.index;
			self.parameter.size = self.pageSize;
			httpService(self.url,self.parameter,function(json){
				self.pagination.loading = false;
				if (json.result.length==0){	
					self.pagination.has_next = false;
				}else{
					self.results = self.results.concat(json.result);	
					if (self.callback){
						self.callback(self.results);
					}
				}
				
			})	
			return self;
		}
		this.reset = function(reload){
			self.results =[];
			self.pagination = {index:0, size:20, loading:false, has_next:true};			
			if (reload){
				self.load_data();
			}
			return self;
		}
		this.page_size = function(value){
			self.pageSize = value;
			return self;
		}
		this.need_more = function(){
			self.load_data();
		}
		this.on_scroll = function(selector,scroll_element){
			self.scroll_on_elelment = true;
			var main = $(selector);			
			scroll_element = scroll_element || 'li';
			main.scroll(function(){
				var obj = this;
				if ($(obj).find(scroll_element+ ":visible").length==0){
	       			return;
	      		}	
				var last_scrolltop = $(obj).find(scroll_element+ ":visible").last().offset().top - $(obj).offset().top;
				var h = $(obj).height();
				var diff = h - last_scrolltop;			
				if (diff >0 ){
					self.need_more();
				}
			});
			return self;
		}
		window.onscroll = function(ev) {
    		if ((window.innerHeight + window.scrollY) >= document.body.offsetHeight) {
        		// you're at the bottom of the page  
        		if (!self.scroll_on_elelment){      		
        			self.need_more();
        		}
    		}
		};
		

	}
	return Pagination;
})


function timeDifference(current, previous) {

    var msPerMinute = 60 * 1000;
    var msPerHour = msPerMinute * 60;
    var msPerDay = msPerHour * 24;
    var msPerMonth = msPerDay * 30;
    var msPerYear = msPerDay * 365;

    var elapsed = current - previous;

    if (elapsed < msPerMinute) {
         return Math.round(elapsed/1000) + ' seconds ago';   
    }

    else if (elapsed < msPerHour) {
         return Math.round(elapsed/msPerMinute) + ' minutes ago';   
    }

    else if (elapsed < msPerDay ) {
         return Math.round(elapsed/msPerHour ) + ' hours ago';   
    }

    else if (elapsed < msPerMonth) {
        return 'about ' + Math.round(elapsed/msPerDay) + ' days ago';   
    }

    else if (elapsed < msPerYear) {
        return 'about ' + Math.round(elapsed/msPerMonth) + ' months ago';   
    }

    else {
        return 'about ' + Math.round(elapsed/msPerYear ) + ' years ago';   
    }
}
