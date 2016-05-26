var stream = require('stream');

function AlphabetGenerator() {
}

AlphabetGenerator.prototype = new stream.Readable({objectMode: true});

AlphabetGenerator.prototype._read = function (size) {
    'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('').forEach(letter => this.push(letter));
    this.push(null);
};

module.exports = AlphabetGenerator;
