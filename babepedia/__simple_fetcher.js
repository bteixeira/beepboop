var stream = require('stream');
var util = require('util');

var utils = require('../utils');

var logger = utils.getLogger('SimpleFetcher');

function SimpleFetcher() {
	stream.Transform.call(this, {objectMode: true});
}
util.inherits(SimpleFetcher, stream.Transform);

SimpleFetcher.prototype._transform = function (url, encoding, callback) {
	logger.debug(`(Fetching) ${url}`);
	utils.fetch(url, ($) => {
		logger.info(`(Fetched) ${url}`);
		callback(null, {
			url: url,
			$: $
		});
	});
};

module.exports = SimpleFetcher;
