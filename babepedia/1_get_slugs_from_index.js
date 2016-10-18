var fs = require('fs');
var stream = require('stream');

var split = require('split2');

var SimpleFetcher = require('./__simple_fetcher');
var LineOutputter = require('./__line_outputter');

var output = process.stdout;
if (process.argv[2]) {
	output = fs.createWriteStream(process.argv[2]);
}


function BabepediaBabeSlugParser() {
}

BabepediaBabeSlugParser.prototype = new stream.Transform({objectMode: true});

BabepediaBabeSlugParser.prototype._transform = function (doc, encoding, callback) {
	var $ = doc.$;

	var $links = $('#content > ul li a');

	//console.log(`got ${$links.length} links`); // Create a '-v verbose' option instead in case this is needed

	$links.each((i, a) => this.push($(a).attr('href')));
	callback();
};


process.stdin
	.pipe(split())
	.pipe(new SimpleFetcher())
	.pipe(new BabepediaBabeSlugParser())
	.pipe(new LineOutputter())
	.pipe(output)
;