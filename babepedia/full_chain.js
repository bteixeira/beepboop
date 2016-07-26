var stream = require('stream');
var url = require('url');
var util = require('util');

var cheerio = require('cheerio');

var utils = require('../utils');

var AlphabetGenerator = require('./__alphabet_generator');
var UrlPrepender = require('../transforms/urlPrepender');
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
var LinkExtractor = require('../transforms/linkExtractor');
var BabepediaModelInfoExtractor = require('./babepediaModelInfoExtractor');
var PageFetcher = require('../transforms/pageFetcher');

function makePass() {
    var timestamp = Date.now();
    var logger = utils.getLogger('PASS');

    logger.info('Starting');

    new AlphabetGenerator()
        .pipe(new UrlPrepender('http://www.babepedia.com/index/'))
        .pipe(new PageFetcher())
        .pipe(new LinkExtractor('#content > ul li a'))
        // .pipe(new UrlPrepender('http://www.babepedia.com'))
        .pipe(new Parallelizer(5, UrlFetcher))
        .pipe(new PageDump('../data/babepedia/pages_raw/', '.html.json'))
        .on('finish', function () {
            logger.info('Expiring files');
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
                        .pipe(new BabepediaModelInfoExtractor())
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
                        // .pipe(new LinkExtractor('.gallery.useruploads .thumbnail a'))
                        .pipe(new FilterForModel())
                        .pipe(new ImageFetcher('babepedia'))
                        .pipe(new ImageFeed(timestamp))
                            .on('finish', () => {
                                var now = new Date();
                                logger.info(`Pass finished (took ${now.getTime() - timestamp}ms)`);
                            })
                    ;

                }
            });
        })
    ;
}

makePass();
setInterval(makePass, 24 * 3600 * 1000);
