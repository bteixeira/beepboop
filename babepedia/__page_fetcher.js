var stream = require('stream');
var util = require('util');

var request = require('request');

function PageFetcher() {
	stream.Transform.call(this, {objectMode: true});
}
util.inherits(PageFetcher, stream.Transform);

PageFetcher.prototype._transform = function (page, encoding, callback) {
	request(page.url, (err, res, body) => {
		callback(err, Object.assign({}, page, {doc: body}));
	});
};

module.exports = PageFetcher;
