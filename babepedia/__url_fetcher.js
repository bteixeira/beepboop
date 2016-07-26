var stream = require('stream');
var util = require('util');

var request = require('request');

const utils = require('../utils');
logger = utils.getLogger('UrlFetcher');

var n = 1;

function UrlFetcher() {
    stream.Transform.call(this, {objectMode: true});
    this._n = n++;
    this._logger = logger.child({N: this._n});
}
util.inherits(UrlFetcher, stream.Transform);

UrlFetcher.prototype._transform = function UrlFetcher(url, encoding, callback) {
    this._logger.debug(`(Fetching) ${url}`);
    request(url, (err, res, body) => {
        if (err) {
            this._logger.error(err, `While fetching ${url}`);
            callback(err);
        } else {
            this._logger.info(`(Fetched) ${url}`);
            callback(null, {
                url: url,
                doc: body
            });
        }
    })
};

module.exports = UrlFetcher;
