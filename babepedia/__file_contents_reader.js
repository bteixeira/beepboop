var fs = require('fs');
var stream = require('stream');
var util = require('util');

function FileContentsReader() {
    stream.Transform.call(this, {objectMode: true});
}
util.inherits(FileContentsReader, stream.Transform);

FileContentsReader.prototype._transform = function (filename, encoding, callback) {
    fs.readFile(filename, callback);
};

module.exports = FileContentsReader;
