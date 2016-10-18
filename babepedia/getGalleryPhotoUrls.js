var cheerio = require('cheerio');
var utils = require('../utils');
var fs = require('fs');

utils.readEachLine(process.stdin, function (slug, next) {
	var filename = __dirname + '/gallery_photo_urls/' + slug + '.txt';
	console.log('File opened, writing to "' + filename + '"...');
	var ws = fs.createWriteStream(filename);
	utils.readEachLine(__dirname + '/gallery_urls/' + slug + '.txt', function (galUrl, next) {
		utils.fetchPage('http://www.babepedia.com' + galUrl, function (content) {
			var $ = cheerio.load(content);
			var $links = $('#gallery a.img');
			$links.each(function () {
				ws.write($(this).attr('href') + '\n');
			});
			next();
		}, true);
	}, false, function () {
		ws.end(function () {
			console.log('File closed.');
			next();
		});
	});
});
