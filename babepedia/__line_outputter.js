var stream = require('stream');

function LineOutputter() {
}

LineOutputter.prototype = new stream.Writable({objectMode: true});

LineOutputter.prototype._write = function (chunk, encoding, callback) {
    console.log(String(chunk));
    callback();
};

module.exports = LineOutputter;
