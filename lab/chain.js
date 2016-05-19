var fs = require('fs');

var Generator = require('./1_generator');
var Fetcher = require('./2_fetcher');
var JSONifier = require('./3_JSONify_anything');

new Generator()
.pipe(new Fetcher())
.pipe(new JSONifier(4))
.pipe(fs.createWriteStream('./dump.json'));
