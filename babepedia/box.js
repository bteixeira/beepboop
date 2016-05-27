var split = require('split2');

var LineOutputter = require('./__line_outputter');
var lineOutputter = new LineOutputter();

var Boxed = require('./' + process.argv[2]);
var boxed = new Boxed();

process.stdin
    .pipe(split())
    .pipe(boxed)
    .pipe(lineOutputter)
    .pipe(process.stdout)
;
