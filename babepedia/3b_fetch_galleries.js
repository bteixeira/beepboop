var stream = require('stream');
var url = require('url');

var cheerio = require('cheerio');

var DirFilesIterator = require('./__dir_files_iterator');
var FileContentsReader = require('./__file_contents_reader');
var Wrapper = require('./__wrapper');
var PageFetcher = require('./__page_fetcher');
var PageDump = require('./__page_dump');

new DirFilesIterator('../data/babepedia/pages_raw')
    .pipe(new FileContentsReader())
    .pipe(new Wrapper(JSON.parse))
    .pipe(new stream.Transform({
        objectMode: true,
        transform: function (page, encoding, callback) {

            var url_ = page.url;
            var l = url_.lastIndexOf('/');
            var slug = url_.slice(l);
            var html = page.doc;
            var $ = cheerio.load(html);
            var $links = $('#content .separate .thumbshot a');

            if (!$links.length) {
                callback();
                return;
            }

            $links.each((i, a) => {
                this.push({
                    slug: slug,
                    url: url.resolve('http://www.babepedia.com', $(a).attr('href'))
                });
            });
            callback();
        }
    }))
    .pipe(new PageFetcher())
    .pipe(new PageDump('../data/babepedia/galleries_raw/', '.html.json'))
;
