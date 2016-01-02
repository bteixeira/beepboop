var pg = require('pg');
var request = require('request');
var cheerio = require('cheerio');

var chunks = [];

process.stdin.on('data', function (data) {
    chunks.push(data);
}).on('end', function () {
    var content = chunks.map(String).join('');
    var list = content.split('\n');

    var i = 0;

    function getIt () {
        var url = 'http://www.boobpedia.com' + list[i++];
        console.log('Getting "' + url + '"...');
        request.get(url).on('response', function (res) {
            console.log('Receiving...');
            var chunks = [];
            //console.log(res);
            res.on('data', function (data) {
                chunks.push(data.toString());
            }).on('end', function () {
                console.log('Got it.');
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
                        enhanced = $tr.find('td').last().text().trim();
                    }else {
                        //console.log('|' + title + '|');
                    }
                });

                console.log(name, nationality, dob, size, enhanced);
                // TODO trigger PG request
                getIt();

            });
        });
    }

    getIt();

});
