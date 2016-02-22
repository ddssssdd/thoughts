var Auto_update = function(config){
  var schedule = require('node-schedule');
  console.log("Scheduling to auto update novels");

  var rule = new schedule.RecurrenceRule();
  rule.hour = 1;
  var book_result =[];
  var j = schedule.scheduleJob(rule, function(){  
    schedule_update(book_result,function(arr){ });
  });
  var rule2 = new schedule.RecurrenceRule();
  rule2.hour = 2;
  schedule.scheduleJob(rule2,function(){
    if (book_result.length>0){
      var result = [];
      for(var i=0;i<book_result.length;i++){
        var b = book_result[i];
        result.push(b.book.title+'--'+b.title);
      };
      var email = {to:"a060116@163.com",subject:"subject",html:result.join(";"),attachments:[]};
        require("../common/email").send_and_call(null,email,function(err,info){
          console.log(info);
      });
      book_result =[];
    }
    
  });
}

var update_book = function (book,index,url,title){
  var m = require("mongoose");
  var spider = require("../common/spider");
  var BookItems = m.model("book_items");
  spider.load_html(url,"#content",function(ele){
    if (ele.status){

      BookItems.insertOrUpdate(book,index,url,title,ele.result);
    }
  });
}
var schedule_update = function(book_result,callback){
  var result = [];
  var m = require("mongoose");
  var Book = m.model("books");
  var Items = m.model("book_items");
  var spider = require("../common/spider");
  var Promise = require("promise");
  debugger;
  Book.find({in_scheduled:true}).exec(function(err,books){
    //callback(books);
    if (err){
      callback({status:false,message:'Fetch data error'});

    }else{
      var arr = [];
      for(var i=0;i<books.length;i++){
        var book = books[i];
        var promise = new Promise(function(resolve,reject){
          
          spider.load_url(book.url,"dd>a",function(json){
            var list = [];
            if (json.status){
              
              json.result.each(function(){
                try{
                  if (this.attribs && this.attribs.href){
                    var chapter = {url:book.url+this.attribs.href.replace(/\s/g,''),title:this.children[0].data};                 
                    list.push(chapter);
                  } 
                }catch(err){
                  console.log(err);
                }
                
              });

              for(var j=0;j<list.length;j++){
                var item = list[j];
                var index = j;
                var item_url = item.url;
                var item_title = item.title;
                //update_book(book,index,item_url,item_title);
                var verifyAndUpdate = function (book,item_url,item_title,index){
                  Items.findOne({book_id:book,url:item_url},function(err,book_chapter){
                    if (!err && book_chapter){
                      console.log(book_chapter.title);
                      //book_result.push({has:true,title:book_chapter.title});

                    }else{                  
                      update_book(book,index,item_url,item_title);                                        
                      book_result.push({book:book,index:index,title:item_title});
                      console.log("Added ..............................." +item_title);
                    }
              
                  }); 
                }
                verifyAndUpdate(book,item_url,item_title,index);
                  
              };

              resolve(book);
            }else{
              reject(json);
            }
            
          });
        });       
        arr.push(promise);  
      }
      Promise.all(arr)
      .then(function(data){
          console.log(data);
          callback(data);
        },function(errors){
          console.log(errors);
      });
    }
    
  })
}


module.exports = Auto_update;