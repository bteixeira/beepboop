var stream = require('stream');

var split = require('split2');

var SimpleFetcher = require('./__simple_fetcher');
var LineOutputter = require('./__line_outputter');


function BabepediaBabeSlugParser() {
}

BabepediaBabeSlugParser.prototype = new stream.Transform({objectMode: true});

BabepediaBabeSlugParser.prototype._transform = function (doc, encoding, callback) {
    var $ = doc.$;

    var $links = $('#content > ul li a');

    console.log(`got ${$links.length} links`);

    $links.each((i, $a) => this.push($a.attr));
    //$links.each((i, $lnk) => this.push($lnk));
    callback();
};


process.stdin
    .pipe(split())
    .pipe(new SimpleFetcher())
    .pipe(new BabepediaBabeSlugParser())
    .pipe(new LineOutputter())
;