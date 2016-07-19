var stream = require('stream');
var util = require('util');

var request = require('request');

var n = 1;

function UrlFetcher() {
    stream.Transform.call(this, {objectMode: true});
    this._n = n++;
}
util.inherits(UrlFetcher, stream.Transform);

UrlFetcher.prototype._transform = function UrlFetcher(url, encoding, callback) {
    console.log(`#${this._n} Fetching ${url}...`);
    request(url, (err, res, body) => {
        this.push({
            url: url,
            doc: body
        });
        callback(err);
    })
};

module.exports = UrlFetcher;
