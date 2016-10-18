var pg = require('pg');
var request = require('request');
var cheerio = require('cheerio');

var chunks = [];

var connString = 'postgres://brains:brains@localhost/beepboob';

pg.connect(connString, function (err, client, done) {
	if (err) {
		return console.error('could not connect to postgres', err);
	}

	process.stdin.on('data', function (data) {
		chunks.push(data);
	}).on('end', function () {
		var content = chunks.map(String).join('');
		var list = content.split('\n');

		var i = 0;

		function getIt() {
			console.log('\n');
			if (i >= list.length) {
				console.log('All work done.');
				return client.end();
			}
			var url = 'http://www.boobpedia.com' + list[i++];
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
					var name = $('h1').text();
					var nationality;
					var size;
					var dob;
					var enhanced;
					$('table.infobox tr').each(function (i, tr) {
						var $tr = $(tr);
						var title = $tr.find('td').first().text();
						if (title === 'Born:') {
							dob = $tr.find('.bday').text();
						} else if (title === 'Nationality:') {
							nationality = $tr.find('td').last().text().trim();
						} else if (title === 'Bra/cup size:') {
							size = $tr.find('td a').text().trim();
						} else if (title === 'Boobs:') {
							//enhanced = $tr.find('td').last().text().trim();
							enhanced = $tr.find('td').last().text().trim().toLowerCase() !== 'natural';
						} else {
							//console.log('|' + title + '|');
						}
					});

					console.log(name, nationality, dob, size, enhanced);
					// TODO trigger PG request
					var query = 'INSERT INTO models (name, dob, nationality, cup, enhanced) VALUES (' +
						'\'' + name.replace(/'/g, '\'\'') + '\', ' +
						(dob ? ('\'' + dob + '\'') : 'null') + ', ' +
						(nationality ? ('\'' + nationality.replace(/'/g, '\'\'') + '\'') : 'null') + ', ' +
						(size ? ('\'' + size.replace(/'/g, '\'\'') + '\'') : 'null') + ', ' +
						(typeof enhanced === 'boolean' ? ('\'' + enhanced + '\'') : 'null') +
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