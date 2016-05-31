var stream = require('stream');
var util = require('util');

function LineOutputter() {
    stream.Transform.call(this, {objectMode: true});
}
util.inherits(LineOutputter, stream.Transform);

LineOutputter.prototype._transform = function (chunk, encoding, callback) {
    this.push(String(chunk) + '\n');
    callback();
};

module.exports = LineOutputter;
