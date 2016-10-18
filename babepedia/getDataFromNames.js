var pg = require('pg');
var request = require('request');
var cheerio = require('cheerio');

var chunks = [];

var connString = 'postgres://brains:brains@localhost/beepboob';

var MONTHS = {
	January: '01',
	February: '02',
	March: '03',
	April: '04',
	May: '05',
	June: '06',
	July: '07',
	August: '08',
	September: '09',
	October: '10',
	November: '11',
	December: '12'
};

pg.connect(connString, function (err, client, done) {
	if (err) {
		return console.error('could not connect to postgres', err);
	}

	process.stdin.on('data', function (data) {
		chunks.push(data);
	}).on('end', function () {
		var content = chunks.map(String).join('');
		var list = content.split('\n');
		var slug;

		var i = 0;

		function getIt() {
			console.log('\n');
			if (i >= list.length) {
				console.log('All work done.');
				return client.end();
			}
			slug = list[i++];
			var url = 'http://www.babepedia.com/babe/' + slug;
			console.log(new Date(), 'Getting "' + url + '"...');
			request.get(url).on('response', function (res) {
				console.log(new Date(), 'Receiving...');
				var chunks = [];
				//console.log(res);
				res.on('data', function (data) {
					console.log(new Date(), 'Got a chunk...');
					chunks.push(data.toString());
				}).on('end', function () {
					console.log(new Date(), 'Got it.');
					var text = chunks.join('');
					var $ = cheerio.load(text);
					var name = $('#bioarea h1').text().trim();
					var nationality;
					var size;
					var dob;
					var natural;
					$('#bioarea ul li').each(function (i, li) {
						var $li = $(li);
						var title = $li.find('.label').text();
						if (title === 'Birthdate:') {
							dob = $li.text().slice('Birthdate: '.length).match(/\w+\s+(\d\d?)\w*\s+of\s+(\w+)\s+(\d\d\d\d)/);
							if (dob) {
								dob = dob[3] + '-' + MONTHS[dob[2]] + '-' + dob[1];
							}
						} else if (title === 'Birthplace') {
							nationality = $li.text().slice('Birthplace: '.length);
						} else if (title === 'Bra/cup size:') {
							size = $li.text().slice('Bra/cup size: '.length);
						} else if (title === 'Boobs:') {
							natural = $li.text().slice('Boobs: '.length).toLowerCase();
							natural = natural.indexOf('real') !== -1 || natural.indexOf('natural') !== -1;
						} else {
							//console.log('|' + title + '|');
						}
					});

					console.log([name, nationality, dob, size, natural].join(' | '));
					var query = 'INSERT INTO models (name, dob, nationality, cup, "natural", babepedia_slug) VALUES (' +
						'\'' + name.replace(/'/g, '\'\'') + '\', ' +
						(dob ? ('\'' + dob + '\'') : 'null') + ', ' +
						(nationality ? ('\'' + nationality.replace(/'/g, '\'\'') + '\'') : 'null') + ', ' +
						(size ? ('\'' + size.replace(/'/g, '\'\'') + '\'') : 'null') + ', ' +
						(typeof natural === 'boolean' ? ('\'' + natural + '\'') : 'null') +
						', \'' + slug + '\'' +
						');';
					console.log('QUERY:', query);
					client.query(query, [], function (err, result) {
						//done();
						if (err) {
							return console.error('error running query', err);
						}
						console.log('Query seems successful:', result.rows);
						getIt();
					});


				});
			});
		}

		getIt();

	});
});