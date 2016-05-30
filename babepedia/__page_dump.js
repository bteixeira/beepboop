var fs = require('fs');
var stream = require('stream');

function PageDump(prefix, suffix) {
    this._prefix = prefix;
    this._suffix = suffix;
}

PageDump.prototype = new stream.Transform({objectMode: true});

PageDump.prototype._transform = function (page, encoding, callback) {
    var filename = this._prefix + page.url.replace(/[ \.\/\:-]+/g, '_') + this._suffix;
    console.log(`Writing to ${filename}...`);
    fs.writeFile(filename, page.doc, function (err) {
        console.log('done!');
        callback(err);
    });
};

module.exports = PageDump;
