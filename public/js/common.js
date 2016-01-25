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
.factory("logger",function(){ // log wrapper
	return {
		log:function(msg){
			console.log(msg);
		}
	}
})
.factory("httpService",function($http,logger,md5){//use this will cache the result and return cache result first.
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
				logger.log("Get ["+url+"] from cache");
			}	
		}catch(error){
			logger.log("Failed to get value from localstorage. Error: "+error);
		}
		
		$http.post(url,parameter).success(function(json){
			
			try{
				localStorage.setItem(cacheKey,(JSON.stringify(json)));	
				logger.log("Write ["+url+"] result to cache");
			}catch(error){
				localStorage.clear();
				logger.log("Failed to write value to localstorage. Error: "+error);
			}
			if (success){
				success(json);
			}
			
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
	
});


