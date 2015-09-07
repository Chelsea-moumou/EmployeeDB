var express = require('express');
var request = require('request');
var cheerio = require('cheerio');
var fs = require('fs');

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
var uriArray = [];
var tagArray = [];
var categoryArray = [];
var chapterArray = [];
var linkChapterArray = [];
var booknameArray = [];
var bookLinkArray = [];
var timestampArray = [];
var authorArray = [];

fs.readFile('./config', 'utf8', function (err,data) {
  if (err) {
    return console.log(err + "error");
  }
  // console.log(data);
  var json = JSON.parse(data);
  var websites = json.length;
  console.log(websites);
  for(var i = 0; i < websites; i++) { 
      uriArray[i] = json[i].uri1 + "1" + json[i].uri2;
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
    if(j >= uriArray.length){
      return;
    }
    console.log(uriArray[j]);
    request(uriArray[j], function(error, response, html){
      if(!error){
        var $ = cheerio.load(html);
        $(tagArray[j]).each(function(i, element){
            var a = $(this);
            console.log(j+"j");
            //console.log(a.children().first() + '<br/>');
            var category = parseSy(categoryArray[j], a);
            // console.log(category);
            // console.log(typeof category);
            if(!category){
              console.log("miu!");
            }
            // console.log( a.children().eq(1).children().eq(0).text().trim());
            var userName = parseSy(booknameArray[j], a);
            // console.log(userName);
            // console.log(a.children().eq(2).children().first().text().trim());
            var chapter = parseSy(chapterArray[j], a);
            // console.log(chapter);
            // console.log(a.children().eq(2).children().eq(1).text());
            var linkChapter = parseSy(linkChapterArray[j],a);
            // console.log(a.children().eq(2).children().eq(1).attr('href'));
            // console.log(linkChapter);
            var link = parseSy(bookLinkArray[j],a);
            // console.log(a.children().eq(2).children().eq(0).children().eq(0).attr('href'));
            // console.log(link);
            var author = parseSy(authorArray[j],a);
            // console.log(author);
            // console.log(a.children().eq(4).children().eq(0).text().trim());
            var userEmail = parseSy(timestampArray[j],a);
            // console.log(userEmail);
            // console.log(a.children().eq(5).text());
            
          });
        
      }
      helper(j + 1);
      
    });
  }
  

});

