var express = require('express');
var request = require('request');
var cheerio = require('cheerio');
var async = require('async');
var monk = require('monk');
var db = monk('localhost:27017/nodetest1');
var request = require('request');
var CronJob = require('cron').CronJob;
var fs = require('fs');

var uri1Array = [];
var uri2Array = [];
var tagArray = [];
var categoryArray = [];
var chapterArray = [];
var linkChapterArray = [];
var booknameArray = [];
var bookLinkArray = [];
var timestampArray = [];
var authorArray = [];
  
var job = new CronJob('1 * * * * *', function() {
  /*
   * Runs every minute 
   */
   fs.readFile('./config', 'utf8', function (err,data) {
      if (err) {
        return console.log(err + "error");
      }
      // console.log(data);
      var json = JSON.parse(data);
      var websites = json.length;
      
      for(var i = 0; i < websites; i++) { 
          uri1Array[i] = json[i].uri1;
          uri2Array[i] = json[i].uri2;
          tagArray[i] = json[i].tag;
          categoryArray[i] = json[i].category;
          chapterArray[i] = json[i].chapter;
          linkChapterArray[i] = json[i].linkChapter;
          booknameArray[i] = json[i].userName;
          bookLinkArray[i] = json[i].link;
          timestampArray[i] = json[i].userEmail;
          authorArray[i] = json[i].author;
          console.log(authorArray[i]);
      } 
      helper(0);
      function helper(j){
        if(j >= uri1Array.length){
          return;
        }
        console.log(uri1Array[j]);
        for(k = 1; k < 2; k++) {
        request(uri1Array[j] + k +uri2Array[j] , function(error, response, html){
          if(!error){
            var $ = cheerio.load(html);
            $(tagArray[j]).each(function(i, element){
                var a = $(this);
                
                var category = parseSy(categoryArray[j], a);
                var userName = parseSy(booknameArray[j], a);
                var chapter = parseSy(chapterArray[j], a);
                var linkChapter = parseSy(linkChapterArray[j],a);
                var link = parseSy(bookLinkArray[j],a);
                var author = parseSy(authorArray[j],a);
                var userEmail = parseSy(timestampArray[j],a);
                if(userName){

                var collection = db.get('usercollection');
                collection.find({'username' : userName}, function(err, docs){
                    if(err){
                        console.log("err");
                    }else{
                        // console.log(docs);
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
              }
              });
            
          }
          helper(j + 1);
          
        });
        }
      }
   });
   },function () {
    /* This function is executed when the job stops */
    console.log('stop');
  },
  true, /* Start the job right now */
  'America/Los_Angeles'/* Time zone of this job. */
);

function parseSy(str,b){
  // console.log(str);
  var length = str.length;
  var m = 0;
  while(m < length){
    switch(str.charAt(m)){
      case 'c':
        b = b.children();
        break;
      case 'x':
        b = b.text();
        break;
      case 't':
        b = b.trim();
        break;
      case 'a':
        b = b.attr('href');
        break;
      case 'l':
        b = b.attr('title');
        break;
      default:
        b = b.eq(parseInt(str.charAt(m)));
        break;
    }
    m++;
  }
  return b;
}