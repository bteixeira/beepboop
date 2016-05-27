var stream = require('stream');
var url = require('url');

function SlugAppender(base) {
    this._base = base;
}

SlugAppender.prototype = new stream.Transform({
    objectMode: true,
    transform: function (slug, encoding, callback) {
        this.push(url.resolve(this._base, slug));
        callback();
    }
});

module.exports = SlugAppender;
