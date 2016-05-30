var stream = require('stream');

var request = require('request');

function UrlFetcher() {
}

UrlFetcher.prototype = new stream.Transform({objectMode: true});

UrlFetcher.prototype._transform = function (url, encoding, callback) {
    console.log(`Fetching ${url}...`);
    request(url, (err, res, body) => {
        console.log('got it!');
        this.push({
            url: url,
            doc: body
        });
        callback(err);
    })
};

module.exports = UrlFetcher;
