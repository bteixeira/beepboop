var split = require('split2');

var SlugAppender = require('./__slug_appender');
var Parallelizer = require('./__parallelizer');
var UrlFetcher = require('./__url_fetcher');
var PageDump = require('./__page_dump');

process.stdin
    .pipe(split())
    .pipe(new SlugAppender('http://www.babepedia.com'))
    .pipe(new Parallelizer(
        5, UrlFetcher)
    )
    .pipe(new PageDump('../data/babepedia/pages_raw/', '.html'))
;