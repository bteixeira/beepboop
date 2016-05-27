var stream = require('stream');

function LineOutputter() {
}

LineOutputter.prototype = new stream.Transform({objectMode: true});

LineOutputter.prototype._transform = function (chunk, encoding, callback) {
    this.push(String(chunk) + '\n');
    callback();
};

module.exports = LineOutputter;
