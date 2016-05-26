var stream = require('stream');

var utils = require('../utils');

function SimpleFetcher() {
}

SimpleFetcher.prototype = new stream.Transform({objectMode: true});

SimpleFetcher.prototype._transform = function (url, encoding, callback) {
    utils.fetch(url, ($) => {
        this.push({
            url: url,
            $: $
        });
        callback();
    });
};

module.exports = SimpleFetcher;
