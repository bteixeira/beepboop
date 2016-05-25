var stream = require('stream');
var request = require('request');
var cheerio = require('cheerio');

function fetch (url, callback) {
    request(url, function (err, res, body) {
        if (err) {
            throw err;
        }
        var $ = cheerio.load(body);
        callback($);
    });
}

var slugCrawler = new stream.Transform({objectMode: true});
slugCrawler._transform = function (url, encoding, callback) {
    fetch(url, $ => {

    });
};
