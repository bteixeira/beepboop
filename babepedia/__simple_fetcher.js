var stream = require('stream');
var util = require('util');

var utils = require('../utils');

function SimpleFetcher() {
    stream.Transform.call(this, {objectMode: true});
}
util.inherits(SimpleFetcher, stream.Transform);

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
