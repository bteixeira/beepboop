var stream = require('stream');
var url = require('url');
var util = require('util');

function SlugAppender(base) {
    stream.Transform.call(this, {objectMode: true});
    this._base = base;
}
util.inherits(SlugAppender, stream.Transform);

SlugAppender.prototype._transform = function (slug, encoding, callback) {
    this.push(url.resolve(this._base, slug));
    callback();
};

module.exports = SlugAppender;
