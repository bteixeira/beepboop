var stream = require('stream');
var util = require('util');
var cheerio = require('cheerio');

var utils = require('../utils');
var logger = utils.getLogger('FilterModelsForPhotos');

function FilterModelsWithoutInfo() {
    stream.Transform.call(this, {objectMode: true});
}
util.inherits(FilterModelsWithoutInfo, stream.Transform);

FilterModelsWithoutInfo.prototype._transform = function (page, encoding, callback) {
    var html = page.doc;
    var $ = cheerio.load(html);

    var $thumbshots = $('#content .separate .thumbshot');
    var $thumbnails = $('#content .separate .thumbnail');
    if (!$thumbshots.length && !$thumbnails.length) {
        logger.info(`Page ${page.url} discarded, no photos`);
    } else {
        this.push(page);
    }

    callback();
};

module.exports = FilterModelsWithoutInfo;
