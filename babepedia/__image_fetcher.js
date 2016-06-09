var stream = require('stream');
var util = require('util');

var request = require('request');

function ImageFetcher(source) {
    stream.Transform.call(this, {objectMode: true});
    this._source = source;
}
util.inherits(ImageFetcher, stream.Transform);

ImageFetcher.prototype._transform = function (img, encoding, callback) {
    request({uri: img.url, encoding: null}, (err, res, body) => {
        img = Object.assign({}, img, {content: body});
        img.source = this._source;
        callback(err, img);
    });
};

module.exports = ImageFetcher;
