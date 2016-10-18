var stream = require('stream');
var util = require('util');

var cheerio = require('cheerio');

function Cheerizer() {
	stream.Transform.call(this, {objectMode: true});
}
util.inherits(Cheerizer, stream.Transform);

Cheerizer.prototype._transform = function (chunk, encoding, callback) {
	var $ = cheerio.load(chunk);
	callback(null, $);
};

module.exports = Cheerizer;
