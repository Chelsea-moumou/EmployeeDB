var express = require('express');
var request = require('request');
var cheerio = require('cheerio');
var async = require('async');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});
router.get('/helloworld', function(req, res) {
    res.render('helloworld', { title: 'Hello, World!' });
});
/* GET Userlist page. */
router.get('/userlist', function(req, res) {
    var db = req.db;
    var collection = db.get('usercollection');
    collection.find({"author":{$exists : true}},{},function(e,docs){
        // console.log(docs == "");
        res.render('userlist', {
            "userlist" : docs
        });
    });
});
//search page
/* GET New User page */
router.get('/searchpage', function(req, res) {
	res.render('searchpage', { title: 'Search'});
});
/* POST to Add User Service */
router.get('/search', function(req, res) {

    // Set our internal DB variable
    var db = req.db;
    // Get our form values. These rely on the "name" attributes
    var bookName = req.query.search;
    console.log(bookName);
    // Set our collection
    var collection = db.get('usercollection');

    // Submit to the DB
    collection.find(
        {"username" : bookName},
        {"_id" : 0},
        function (err, docs) {
        if (err) {
            // If it failed, return error
            res.send("There was a problem finding the information to the database.");
        }
        else {
            // console.log(docs[0].list + "list");
            if(docs[0].list){
                var reshtml = "<h2> Search Result ";
                var i = 0;
                // console.log(docs[0].list.length+"length");
                while(i < docs[0].list.length){
                    // console.log(docs[0].list[i].link+"link");
                    reshtml += "<a href=\"" + docs[0].list[i].link+"\">"+ docs[0].list[i].bookname +"</a><br>";
                    i++;
                }
                
                res.send(reshtml);
            }else{
                res.send("<h2> Search Result <a href=\"" + docs[0].link+"\">"+ docs[0].username +"</a>");    
            } 
        }
    });
});



router.get('/scrape', function(req, res){
    var k;
    var reshtml = '';
    
    for(k = 1; k < 2; k++) {
      uri = 'http://all.qidian.com/Book/BookStore.aspx?ChannelId=-1&SubCategoryId=-1&Tag=all&Size=-1&Action=-1&OrderId=6&P=all&PageIndex=' + k + '&update=-1&Vip=-1&Boutique=-1&SignStatus=-1';
      request(uri, function(error, response, html){
        if(!error){
          var $ = cheerio.load(html);
          $('div.sw1').each(function(i, element){
            var a = $(this);

            var category = a.children().eq(1).children().eq(0).text().trim();
            var chapter = a.children().eq(2).children().eq(1).text();
            var linkChapter = a.children().eq(2).children().eq(1).attr('href');
            var userName = a.children().eq(2).children().first().text().trim();
            var link = a.children().eq(2).children().eq(0).children().eq(0).attr('href');
            var author = a.children().eq(4).children().eq(0).text().trim();
            var userEmail = a.children().eq(5).text();

            reshtml = reshtml + category + chapter + userName + userEmail + '<br/>';
            
            var db = req.db;
            // Get our form values. These rely on the "name" attributes

            // Set our collection
            var collection = db.get('usercollection');
        
                collection.find({'username' : userName}, function(err, docs){
                    if(err){
                        console.log("err");
                    }else{
                        // console.log(docs.length);
                        if(docs != ""){
                            collection.update(
                                {"username" : userName},
                                {$set:
                                    {
                                        "chapter" : chapter,
                                        "email" : userEmail
                                    }
                                },function (err, doc) {
                                    if (err) {
                                        // If it failed, return error
                                        res.send("There was a problem updating the information to the database.");
                                    }else {
                                        // And forward to success page
                                        // res.redirect("userlist");
                                    }
                                }
                            );
                            collection.find(
                                {"username" : author},
                                function(e, docs){
                                    if(docs == ""){
                                        collection.insert(
                                            {"username" : author, "list" : [{"category" : category, "bookname" : userName, "link" : link}]},
                                            function(e,doc){
                                                if(e){
                                                    console.log(e + "error");
                                                }
                                            }
                                        );
                                    }else{
                                        collection.update(
                                            {"username" : author},
                                            {
                                                $addToSet:{
                                                     "list" : { "category" : category, "bookname" : userName, "link" : link }
                                                }
                                            },function(e, doc){
                                                if(e){
                                                    console.log(err + "error");
                                                }else{
                                                    // console.log("update sucessful")
                                                }
                                            }
                                        );
                                    }
                                });
                            
                        }else{
                            collection.insert({
                                "category" : category,
                                "username" : userName,
                                "link" : link,
                                "linkchapter" : linkChapter,
                                "chapter" : chapter,
                                "author" : author,
                                "email" : userEmail
                            }, function (err, doc) {
                                if (err) {
                                    // If it failed, return error
                                    res.send("There was a problem adding the information to the database.");
                                }
                                else {
                                    // And forward to success page
                                    // res.redirect("userlist");
                                }
                            });
                            collection.update(
                                {"username" : category},
                                {
                                    $addToSet:{
                                         "list" : { "bookname" : userName, "author" : author, "link" : link }
                                    }
                                },function(e, docs){
                                    if(e){
                                        // console.log(err + "error");
                                    }else{
                                        // console.log("update sucessful")
                                    }
                                }
                            );
                            collection.find(
                                {"username" : author},
                                function(e, docs){
                                    if(docs == ""){
                                        collection.insert(
                                            {"username" : author, "list" : [{"category" : category, "bookname" : userName, "link" : link}]},
                                            function(e,doc){
                                                if(e){
                                                    console.log(e + "error");
                                                }
                                            }
                                        );
                                    }else{
                                        collection.update(
                                            {"username" : author},
                                            {
                                                $addToSet:{
                                                     "list" : { "category" : category, "bookname" : userName, "link" : link }
                                                }
                                            },function(e, doc){
                                                if(e){
                                                    console.log(err + "error");
                                                }else{
                                                    // console.log("update sucessful")
                                                }
                                            }
                                        );
                                    }
                                });
                            // collection.createIndex( { username: "text" } );    
                        }
                    }
                });

             
          });

        }
      });  
      console.log("Done 1 round"); 
       
    }  
    
});
module.exports = router;
