var express = require('express');
var request = require('request');
var cheerio = require('cheerio');
var async = require('async');
// var mongo = require('mongodb');
var monk = require('monk');
var db = monk('localhost:27017/nodetest1');
var request = require('request');
var CronJob = require('cron').CronJob;
var fs = require('fs');
fs.readFile('./config', 'utf8', function (err,data) {
  if (err) {
    return console.log(err + "error");
  }
  
var job = new CronJob('1 * * * * *', function() {
  /*
   * Runs every minute 
   */
    var k;
    var reshtml = '';
    var json = JSON.parse(data);
    var website = json.length;
    for(k = 1; k < 2; k++) {
      // uri = 'http://all.qidian.com/Book/BookStore.aspx?ChannelId=-1&SubCategoryId=-1&Tag=all&Size=-1&Action=-1&OrderId=6&P=all&PageIndex=' + k + '&update=-1&Vip=-1&Boutique=-1&SignStatus=-1';
      uri = json[0].uri1 +k+ json[0].uri2;// leave place for k loop
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
            
            // var db = req.db;
            // Get our form values. These rely on the "name" attributes

            // Set our collection
            var collection = db.get('usercollection');
            // var collection = db.collection('usercollection');
                collection.find({'username' : userName}, function(err, docs){
                    if(err){
                        console.log("err");
                    }else{
                        console.log(docs);
                        if(docs != ""){
                          console.log("has in db");
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
                                        console.log("insert sucessful book");
                                        // And forward to success page
                                        // res.redirect("userlist");
                                    }
                                }
                            );
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
                                    console.log(userName + "insert");
                                    // And forward to success page
                                    // res.redirect("userlist");
                                }
                            });
                            collection.find(
                                {"username" : category},
                                function(e, docs){
                                    if(docs == ""){
                                        collection.insert(
                                            {"username" : category, "list" : [{"author" : author, "bookname" : userName, "link" : link}]},
                                            function(e, doc){
                                                if(e){
                                                    console.log(e + "error");
                                                }else{
                                                    console.log("insert sucessful author");
                                                }
                                            }
                                        );
                                    }else{
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
                                                    console.log("update sucessful category");
                                                }
                                            }
                                        );
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
                                                }else{
                                                    console.log("insert sucessful author");
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
                                                    console.log("update sucessful author");
                                                }
                                            }
                                        );
                                    }
                                }
                            );
                            // collection.createIndex( { username: "text" } );    
                        }
                    }
                });

             
          });

        }
      });  
      console.log("Done 1 round"); 
       
    }  
  }, function () {
    /* This function is executed when the job stops */
    console.log('stop');
  },
  true, /* Start the job right now */
  'America/Los_Angeles'/* Time zone of this job. */
);
});