var stream = require('stream');
var url = require('url');

var cheerio = require('cheerio');

var DirFilesIterator = require('./__dir_files_iterator');
var FileContentsReader = require('./__file_contents_reader');
var Wrapper = require('./__wrapper');
var ImageFetcher = require('./__image_fetcher');
var ImageFeed = require('./__image_feed');

var timestamp = Date.now();

new DirFilesIterator('../data/babepedia/pages_raw_test')
    .pipe(new FileContentsReader())
    .pipe(new Wrapper(JSON.parse))
    .pipe(new stream.Transform({
        objectMode: true,
        transform: function (page, encoding, callback) {

            var url_ = page.url;
            var l = url_.lastIndexOf('/');
            var slug = url_.slice(l + 1);
            var html = page.doc;
            var $ = cheerio.load(html);
            var $links = $('.gallery.useruploads .thumbnail a');

            if (!$links.length) {
                console.log(`Page skipped, no links ${url_}`);
                callback();
                return;
            }

            $links.each((i, a) => {
                this.push({
                    source: 'babepedia',
                    slug: slug,
                    url: url.resolve('http://www.babepedia.com', $(a).attr('href')),
                    revision: timestamp
                });
            });
            callback();
        }
    }))
    .pipe(new ImageFetcher('babepedia'))
    .pipe(new ImageFeed())
;
