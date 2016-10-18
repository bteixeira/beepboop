var path = require('path');
var fs = require('fs');
var utils = require('../utils');
var cheerio = require('cheerio');

utils.readEachLine(process.stdin, function (slug, next) {
	if (!slug) {
		return next();
	}
	var filename = path.join(__dirname, 'pages', slug + '.htm');
	var content = fs.readFileSync(filename);
	var $ = cheerio.load(content);
	var hasBoobs = false;
	$('#bioarea ul li').each(function (i, li) {
		var $li = $(li);
		var title = $li.find('.label').text();
		if (title === 'Boobs:') {
			hasBoobs = true;
		}
	});
	if ($('#profimg a.img').length && hasBoobs) {
		console.log(slug);
	} else {
		console.error('NO INFO', slug);
	}
	next();
});
