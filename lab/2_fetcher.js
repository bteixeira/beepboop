var util = require('util');
var stream = require('stream');
var request = require('request');

function Fetcher() {
    stream.Transform.call(this, {objectMode: true});
}
util.inherits(Fetcher, stream.Transform);
Fetcher.prototype._transform = function (url, encoding, callback) {
    console.log(`Fetching ${url}`);
    request.get(url, (err, req, data) => {
        if (err) {
            callback(err);
        } else {
            this.push({
                url: url,
                data: data
            });
            callback();
        }
    });
};

module.exports = Fetcher;
