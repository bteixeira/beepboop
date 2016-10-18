var fs = require('fs');
var stream = require('stream');
var util = require('util');

var utils = require('../utils');

var logger = utils.getLogger('PageDump');

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
	logger.debug(`(Writing) ${filename}`);
	var contents = JSON.stringify(page);
	utils.justWrite(filename, contents, function (err) {
		if (err) {
			logger.error(err, `While writing ${filename}`);
		} else {
			logger.info(`Dumped ${filename}`);
		}
		callback(err);
	});
};

module.exports = PageDump;
