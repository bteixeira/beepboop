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

		var filename = __dirname + '/singles_urls/' + slug + '.txt';
		utils.readAll(filename, function (content) {
			var urls = content.split('\n');
			getSingle(urls, 0, slug, getIt);
		});
	}

	getIt();
});

function getSingle(urls, i, slug, callback) {
	if (i >= urls.length) {
		callback();
		return;
	}
	var url = urls[i++];
	if (!url) {
		getSingle(urls, i, slug, callback);
		return;
	}
	var extension = url.slice(url.lastIndexOf('.'));
	utils.fetchAndDump('http://www.babepedia.com' + url, __dirname + '/singles/' + slug + '_' + i + extension, function () {
		getSingle(urls, i, slug, callback);
	}, true);
}