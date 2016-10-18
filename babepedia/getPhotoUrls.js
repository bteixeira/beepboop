var fs = require('fs');
var cheerio = require('cheerio');
var utils = require('../utils');

utils.readAll(process.stdin, function (content) {
	var list = content.split('\n');
	var slug;
	var i = 0;

	function getIt() {
		if (i >= list.length) {
			console.log('All work done.');
			return;
		}
		slug = list[i++];
		if (!slug) {
			getIt();
			return;
		}
		var filename = __dirname + '/pages/' + slug + '.htm';
		console.log('Opening file "' + filename + '"');
		utils.readAll(filename, function (content) {
			var filename = __dirname + '/singles_urls/' + slug + '.txt';
			console.log('File opened, writing to "' + filename + '"...');
			var ws = fs.createWriteStream(filename);
			var $ = cheerio.load(content);

			function writeAll($links) {
				$links.each(function () {
					ws.write($(this).attr('href') + '\n');
				});
			}

			var name = $('#bioarea h1').text().trim();
			writeAll($('a[rel="gallery"]'));
			//writeAll($('.thumbshot a')); // UNKNOWN

			// NOT SINGLES
			//writeAll($('h2').filter(function(){return $(this).text().trim() === name + ' Galleries';}).parent().find('a'));
			ws.end();
			console.log('Done.');
			getIt();
		});
	}

	getIt();
});
