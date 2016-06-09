var fs = require('fs');
var path = require('path');
var stream = require('stream');
var util = require('util');

function DirFilesIterator(dir, prependDir) {
    stream.Readable.call(this, {objectMode: true});
    if (typeof prependDir === 'undefined') {
        prependDir = true;
    }
    this._dir = dir;
    this._prependDir = prependDir;
}
util.inherits(DirFilesIterator, stream.Readable);

DirFilesIterator.prototype._read = function (size) {
    if (!this._files) {
        fs.readdir(this._dir, (err, files) => {
            if (err) {
                throw err;
            }
            this._files = files;
            this._i = 0;
            this._read();
        });
    } else {
        var file = this._files[this._i++];
        if (!file) {
            return this.push(null);
        }
        if (this._prependDir) {
            file = path.resolve(this._dir, file);
        }
        this.push(file);

        if (this._i >= this._files.length) {
            this.push(null);
        }
    }
};

module.exports = DirFilesIterator;
