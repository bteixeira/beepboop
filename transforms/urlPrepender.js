var stream = require('stream');
var url = require('url');
var util = require('util');

function UrlPrepender(base) {
	stream.Transform.call(this, {objectMode: true});
	this._base = base;
}
util.inherits(UrlPrepender, stream.Transform);

UrlPrepender.prototype._transform = function (slug, encoding, callback) {
	callback(null, url.resolve(this._base, slug));
};

module.exports = UrlPrepender;
