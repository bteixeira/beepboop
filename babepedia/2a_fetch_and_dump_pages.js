var split = require('split2');

var utils = require('../utils');
var SlugAppender = require('./__slug_appender');
var Parallelizer = require('./__parallelizer');
var UrlFetcher = require('./__url_fetcher');
var PageDump = require('./__page_dump');

var timestamp = new Date();

process.stdin
    .pipe(split = split())
    .pipe(appender = new SlugAppender('http://www.babepedia.com'))
    .pipe(parallelizer = new Parallelizer(
        5, UrlFetcher)
    )
    .pipe(new PageDump('../data/babepedia/pages_raw/', '.html.json'))
    .on('finish', function () {
        console.log('expiring files');
        utils.expireFiles({
            origin: '../data/babepedia/pages_raw/',
            target: '../data/babepedia/pages_old/',
            timestamp: timestamp
        });
    })
;