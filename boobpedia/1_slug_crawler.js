var stream = require('stream');
var request = require('request');
var cheerio = require('cheerio');

var slugCrawler = new stream.Transform({objectMode: true});
slugCrawler._transform = function (url, encoding, callback) {
    fetch(url, $ => {

    });
};
