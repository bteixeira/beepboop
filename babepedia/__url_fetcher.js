var stream = require('stream');
var util = require('util');

var request = require('request');

const utils = require('../utils');
var logger = utils.getLogger('UrlFetcher');

var n = 1;

function UrlFetcher() {
    stream.Transform.call(this, {objectMode: true});
    this._n = n++;
    this._logger = logger;
}
util.inherits(UrlFetcher, stream.Transform);

UrlFetcher.prototype._transform = function UrlFetcher(page, encoding, callback) {
    if (typeof page === 'string') {
        page = {url: page};
    } else {
        page = Object.assign({}, page);
    }
    this._logger.debug(`#${this._n} (Fetching) ${page.url}`);
    request(page.url, (err, res, body) => {
        if (err) {
            this._logger.error(err, `#${this._n} While fetching ${page.url}`);
            callback(err);
        } else {
            this._logger.info(`#${this._n} (Fetched) ${page.url}`);
            page.doc = body;
            callback(null, page);
        }
    })
};

module.exports = UrlFetcher;
