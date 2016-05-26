var stream = require('stream');

var utils = require('../utils');

function SimpleAppender(prefix) {
    this._prefix = prefix;
}

SimpleAppender.prototype = new stream.Transform({objectMode: true});

SimpleAppender.prototype._transform = function (chunk, encoding, callback) {
    this.push(this._prefix + String(chunk));
    callback();
};

module.exports = SimpleAppender;
