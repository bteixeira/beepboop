/**
 * Created by bruno on 01.01.16.
 */

var cheerio = require('cheerio');
var request = require('request');
// http://www.boobpedia.com/boobs/Category:Porn_stars

function getNext(url) {
	request.get('http://www.boobpedia.com' + url).on('response', function (res) {

		var chunks = [];

		res.on('data', function (data) {
			chunks.push(data.toString());
		}).on('end', function () {
			var text = chunks.join('');
			//console.log(text);
			var $ = cheerio.load(text);
			//console.log($('h5').length);
			$('#mw-pages table ul li a').each(function (i, a) {
				var $a = $(a);
				if ($a.text().indexOf('List of ') !== 0) {
					console.log($a.attr('href'));
				}
			});
			var $next = $('#mw-pages').siblings('a').last();
			if ($next.length && $next.text().indexOf('next') !== -1) {
				//console.log('=== GETTING NEXT ===');
				getNext($next.attr('href'));
			}
		});
	});
}

getNext('/boobs/Category:Adult_models');
//getNext('/boobs/Category:Porn_stars');
