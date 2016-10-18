var stream = require('stream');
var url = require('url');

var AlphabetGenerator = require('./__alphabet_generator');
var LineOutputter = require('./__line_outputter');
var SimpleAppender = require('./__simple_appender');
var SlugAppender = require('../transforms/urlPrepender');

new AlphabetGenerator()
	.pipe(new SimpleAppender('index/'))
	.pipe(new SlugAppender('http://www.babepedia.com'))
	.pipe(new LineOutputter())
	.pipe(process.stdout)
;
