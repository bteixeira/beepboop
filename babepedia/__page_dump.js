var fs = require('fs');
var stream = require('stream');
var util = require('util');

function PageDump(prefix, suffix) {
    stream.Transform.call(this, {objectMode: true});
    this._prefix = prefix;
    this._suffix = suffix;
}
util.inherits(PageDump, stream.Transform);

PageDump.prototype._transform = function (page, encoding, callback) {
    var filename =
        this._prefix +
        page.url
            .replace(/^https?\:\/\//g, '')
            .replace(/[ \.\:-]+/g, '_')
            .replace(/\//g, '___') +
        this._suffix;
    console.log(`Writing to ${filename}...`);
    fs.writeFile(filename, page.doc, function (err) {
        console.log('done!');
        callback(err);
    });
};

module.exports = PageDump;
