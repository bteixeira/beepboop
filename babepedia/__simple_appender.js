var stream = require('stream');
var util = require('util');

var utils = require('../utils');

function SimpleAppender(prefix) {
    stream.Transform.call(this, {objectMode: true});
    this._prefix = prefix;
}
util.inherits(SimpleAppender, stream.Transform);

SimpleAppender.prototype._transform = function (chunk, encoding, callback) {
    this.push(this._prefix + String(chunk));
    callback();
};

module.exports = SimpleAppender;
