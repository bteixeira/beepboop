var stream = require('stream');
var util = require('util');

var request = require('request');

const utils = require('../utils');
var logger = utils.getLogger('PageFetcher');

function PageFetcher(source) {
    stream.Transform.call(this, {objectMode: true});
    if (source) {
        this._source = source;
    }
}
util.inherits(PageFetcher, stream.Transform);

PageFetcher.prototype._transform = function PageFetcher(page, encoding, callback) {

    if (typeof page === 'string') {
        page = {url: page};
    } else {
        page = Object.assign({}, page);
    }

    logger.debug(`(Fetching) ${page.url}`);
    request(page.url, (err, res, body) => {
        if (err) {
            logger.error(err, `While fetching ${page.url}`);
            callback(err);
        } else {
            logger.info(`(Fetched) ${page.url}`);
            page.doc = body;
            if (this._source) {
                page.source = this._source;
            }
            callback(null, page);
        }
    })
};

module.exports = PageFetcher;
