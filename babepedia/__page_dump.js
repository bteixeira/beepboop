var fs = require('fs');
var stream = require('stream');
var util = require('util');

var utils = require('../utils');

function PageDump(prefix, suffix) {
    stream.Writable.call(this, {objectMode: true});
    this._prefix = prefix;
    this._suffix = suffix;
}
util.inherits(PageDump, stream.Writable);

PageDump.prototype._write = function (page, encoding, callback) {
    var filename =
        this._prefix +
        page.url
            .replace(/^https?\:\/\//g, '')
            .replace(/[ \.\:-]+/g, '_')
            .replace(/\//g, '___') +
        this._suffix;
    console.log(`Writing to ${filename}...`);
    var contents = JSON.stringify(page);
    utils.justWrite(filename, contents, function (err) {
        callback(err);
        console.log('done!');
    });
};

module.exports = PageDump;
