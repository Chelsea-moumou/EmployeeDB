var express = require('express');
var fs = require('fs');
var request = require('request');
var cheerio = require('cheerio');
var app = express();

      uri = 'http://all.qidian.com/Book/BookStore.aspx?ChannelId=-1&SubCategoryId=-1&Tag=all&Size=-1&Action=-1&OrderId=6&P=all&PageIndex=1&update=-1&Vip=-1&Boutique=-1&SignStatus=-1';
      request(uri, function(error, response, html){
        if(!error){
          var $ = cheerio.load(html);
          $('div.sw1').each(function(i, element){
            var a = $(this);
            //console.log(a.children().first() + '<br/>');
            var link = a.children().eq(2).children().eq(0).children().eq(0).attr('href');
            console.log(link);
          });
        }
      });