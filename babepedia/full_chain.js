var stream = require('stream');
var url = require('url');
var util = require('util');

var cheerio = require('cheerio');

var utils = require('../utils');

var AlphabetGenerator = require('./__alphabet_generator');
var SimpleAppender = require('./__simple_appender');
var SlugAppender = require('./__slug_appender');
var SimpleFetcher = require('./__simple_fetcher');
var Parallelizer = require('./__parallelizer');
var UrlFetcher = require('./__url_fetcher');
var PageDump = require('./__page_dump');
var DirFilesIterator = require('./__dir_files_iterator');
var FileContentsReader = require('./__file_contents_reader');
var Wrapper = require('./__wrapper');
var FilterModelsWithoutInfo = require('./__filter_models_without_info');
var FilterModelsWithoutPhotos = require('./__filter_models_without_photos');
var ModelFeeder = require('./__model_feeder');
var ImageFetcher = require('./__image_fetcher');
var ImageFeed = require('./__image_feed');
var FilterForModel = require('./__filter_for_model');

function BabepediaBabeSlugParser() {
    stream.Transform.call(this, {objectMode: true});
}
util.inherits(BabepediaBabeSlugParser, stream.Transform);
BabepediaBabeSlugParser.prototype._transform = function (doc, encoding, callback) {
    console.log('Yeah...');
    var $ = doc.$;
    var $links = $('#content > ul li a');
    $links.each((i, a) => this.push($(a).attr('href')));
    callback();
};

function makePass() {
    var timestamp = Date.now();

    new AlphabetGenerator()
        .pipe(new SimpleAppender('index/'))
        .pipe(new SlugAppender('http://www.babepedia.com'))
        .pipe(new SimpleFetcher())
        .pipe(new BabepediaBabeSlugParser())
        .pipe(new SlugAppender('http://www.babepedia.com'))
        .pipe(new Parallelizer(5, UrlFetcher))
        .pipe(new PageDump('../data/babepedia/pages_raw/', '.html.json'))
        .on('finish', function () {
            console.log('expiring files');
            utils.expireFiles({
                origin: '../data/babepedia/pages_raw/',
                target: '../data/babepedia/pages_old/',
                timestamp: timestamp,
                done: () => {

                    var filter = new FilterModelsWithoutPhotos();

                    new DirFilesIterator('../data/babepedia/pages_raw')
                        .pipe(new FileContentsReader())
                        .pipe(new Wrapper(JSON.parse))
                        .pipe(new FilterModelsWithoutInfo())
                        .pipe(filter);

                    filter
                        .pipe(new stream.Transform({
                            objectMode: true,
                            transform: function (page, encoding, callback) {

                                var html = page.doc;
                                var $ = cheerio.load(html);

                                var model = {};
                                model.source = 'babepedia';
                                model.slug = page.url.slice(page.url.lastIndexOf('/') + 1).replace(/\.html$/, '');
                                model.attributes = {};
                                model.name = model.attributes.name = $('#bioarea h1').text();
                                $('#bioarea ul li').each((i, li) => {
                                    var $li = $(li);
                                    var $label = $li.find('.label');
                                    var label = $label.text();
                                    var value = $li.text().slice(label.length).trim();
                                    var match = label.match(/(.+?)\:?$/);
                                    if (match) {
                                        label = match[1];
                                        model.attributes[label] = value;
                                    }
                                });
                                console.log('Adding model! ' + page.url);
                                this.push(model);
                                callback();
                            }
                        }))
                        .pipe(new ModelFeeder())
                    ;

                    filter
                        .pipe(new stream.Transform({
                            objectMode: true,
                            transform: function (page, encoding, callback) {

                                var url_ = page.url;
                                var l = url_.lastIndexOf('/');
                                var slug = url_.slice(l + 1);
                                var html = page.doc;
                                var $ = cheerio.load(html);
                                var $links = $('.gallery.useruploads .thumbnail a');

                                console.log('Checking', slug);

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
                        .pipe(new FilterForModel())
                        .pipe(new ImageFetcher('babepedia'))
                        .pipe(new ImageFeed(timestamp))
                            .on('finish', () => {
                                console.log('Pass finished at', new Date());
                            })
                    ;

                }
            });
        })
    ;
}

makePass();
setInterval(makePass, 24 * 3600 * 1000);
// setInterval(makePass, 15000);
