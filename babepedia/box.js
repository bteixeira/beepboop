var split = require('split2');

var LineOutputter = require('./__line_outputter');
var lineOutputter = new LineOutputter();

var Boxed = require('./' + process.argv[2]);
var boxed = new Boxed();

if (boxed.write) { // Should be writable
	process.stdin
		.pipe(split())
		.pipe(boxed)
	;
}

if (boxed.pipe) {
	boxed
		.pipe(lineOutputter)
		.pipe(process.stdout)
	;
}
