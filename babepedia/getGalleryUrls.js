var fs = require('fs');
var cheerio = require('cheerio');
var utils = require('../utils');

utils.readEachLine(process.stdin, function (slug, next) {
    var filename = __dirname + '/pages/' + slug + '.htm';
    console.log('Opening file "' + filename + '"');
    var page = fs.readFileSync(filename);
    var $ = cheerio.load(page);
    var name = $('#bioarea h1').text().trim();
    var $links = $('h2').filter(function(){return $(this).text().trim() === name + ' Galleries';}).parent().find('a');
    if (!$links.length) {
        console.log('No galleries for ' + slug + ', skipping');
        next();
        return;
    }
    filename = __dirname + '/gallery_urls/' + slug + '.txt';
    console.log('File opened, writing to "' + filename + '"...');
    var ws = fs.createWriteStream(filename);
    $links.each(function () {
        ws.write($(this).attr('href') + '\n');
    });
    ws.end(function () {
        console.log('Done.');
        next();
    });
});
