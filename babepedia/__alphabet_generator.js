var stream = require('stream');
var util = require('util');

function AlphabetGenerator() {
    stream.Readable.call(this, {objectMode: true});
}
util.inherits(AlphabetGenerator, stream.Readable);

AlphabetGenerator.prototype._read = function (size) {
    'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('').forEach(letter => this.push(letter));
    this.push(null);
};

module.exports = AlphabetGenerator;
