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
    var url;
    if (typeof page === 'string') {
        url = page;
    } else {
        url = page.url;
    }
    this._logger.debug(`#${this._n} (Fetching) ${url}`);
    // logger.debug(`(Fetching) ${url}`);
    request(url, (err, res, body) => {
        if (err) {
            this._logger.error(err, `#${this._n} While fetching ${url}`);
            // logger.error(err, `While fetching ${url}`);
            callback(err);
        } else {
            this._logger.info(`#${this._n} (Fetched) ${url}`);
            // logger.info(`(Fetched) ${url}`);
            callback(null, {
                url: url,
                doc: body
            });
        }
    })
};

module.exports = UrlFetcher;
