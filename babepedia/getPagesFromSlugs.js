var cheerio = require('cheerio');
var fs = require('fs');
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
		var url = 'http://www.babepedia.com/babe/' + slug;
		utils.fetchPage(url, function (content) {
			var $ = cheerio.load(content);
			var name = $('#bioarea h1').text().trim();
			var nameReplaced = name.replace(/ /g, '_');
			nameReplaced = nameReplaced.replace(/'/g, '%27');
			nameReplaced = nameReplaced.replace(/\(/g, '%28');
			nameReplaced = nameReplaced.replace(/\)/g, '%29');
			nameReplaced = nameReplaced.replace(/é/g, '%C3%A9');
			nameReplaced = nameReplaced.replace(/ç/g, '%C3%A7');
			nameReplaced = nameReplaced.replace(/ü/g, '%C3%BC');
			nameReplaced = nameReplaced.replace(/ö/g, '%C3%B6');
			nameReplaced = nameReplaced.replace(/,/g, '%2C');
			nameReplaced = nameReplaced.replace(/\?/g, '%3F');
			if (nameReplaced !== slug) {
				console.error('MISMATCHING SLUG, PLEASE CHECK');
				console.error('"' + name + '"');
				console.error('"' + slug + '"');
				process.exit(1);
			}
			fs.createWriteStream(__dirname + '/pages/' + slug + '.htm').end(content);
			getIt();
		}, true);
	}

	getIt();
});
