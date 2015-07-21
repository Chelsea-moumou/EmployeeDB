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
    collection.find({},{},function(e,docs){
        res.render('userlist', {
            "userlist" : docs
        });
    });
});
/* GET New User page */
router.get('/newuser', function(req, res) {
	res.render('newuser', { title: 'Add New User'});
});
/* POST to Add User Service */
router.post('/adduser', function(req, res) {

    // Set our internal DB variable
    var db = req.db;

    // Get our form values. These rely on the "name" attributes
    var userName = req.body.username;
    var userEmail = req.body.useremail;

    // Set our collection
    var collection = db.get('usercollection');

    // Submit to the DB
    collection.insert({
        "username" : userName,
        "email" : userEmail
    }, function (err, doc) {
        if (err) {
            // If it failed, return error
            res.send("There was a problem adding the information to the database.");
        }
        else {
            // And forward to success page
            res.redirect("userlist");
        }
    });
});



router.get('/scrape', function(req, res){
    var k;
    var reshtml = '';
    res_array = [];
    
    for(k = 1; k < 11; k++) {
      uri = 'http://all.qidian.com/Book/BookStore.aspx?ChannelId=-1&SubCategoryId=-1&Tag=all&Size=-1&Action=-1&OrderId=6&P=all&PageIndex=' + k + '&update=-1&Vip=-1&Boutique=-1&SignStatus=-1';
      request(uri, function(error, response, html){
        if(!error){
          var $ = cheerio.load(html);
          $('span.swbt').each(function(i, element){
            var a =$(this);
            //console.log(a.children().first() + '<br/>');
            reshtml = reshtml + a.children().first().text() + '<br/>';
            res_array.push(a.children().first().text());
            console.log(res_array);

            var db = req.db;

            // Get our form values. These rely on the "name" attributes
            var userName = a.children().first().text();
            var userEmail = a.children().first().text();

            // Set our collection
            var collection = db.get('usercollection');

            // Submit to the DB
            collection.insert({
                "username" : userName,
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
          });
        
          // res.send(reshtml);
            
        }
      });       
    }  
    // var now = new Date().getTime();
    // while(new Date().getTime() < now + 1000){ /* do nothing */ }
    // if(new Date().getTime() > now + 1000) {
        // console.log(res_array);
        // res.render('scrape', {
        //         "userlist" : res_array
        //     });
    // }
    

    // var now = new Date().getTime();
    // while(new Date().getTime() < now + 10000){ /* do nothing */ } 

    // console.log(res_array);
    // res.render('scrape', {
    //             "userlist" : res_array
    //         });
});
module.exports = router;
