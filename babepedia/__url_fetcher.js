var stream = require('stream');
var util = require('util');

var request = require('request');

function UrlFetcher() {
    stream.Transform.call(this, {objectMode: true})
}
util.inherits(UrlFetcher, stream.Transform);

UrlFetcher.prototype._transform = function UrlFetcher(url, encoding, callback) {
    console.log(`Fetching ${url}...`);
    request(url, (err, res, body) => {
        this.push({
            url: url,
            doc: body
        });
        callback(err);
    })
};

module.exports = UrlFetcher;
