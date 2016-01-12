var fs = require('fs');
var cheerio = require('cheerio');
var utils = require('../utils');

utils.readEachLine(process.stdin, function (slug, next) {
    var filename = __dirname + '/pages/' + slug + '.htm';
    console.log('Opening file "' + filename + '"');
    var page = fs.readFileSync(filename);
    var $ = cheerio.load(page);
    filename = __dirname + '/gallery_urls/' + slug + '.txt';
    console.log('File opened, writing to "' + filename + '"...');
    var ws = fs.createWriteStream(filename);
    var name = $('#bioarea h1').text().trim();
    var $links = $('h2').filter(function(){return $(this).text().trim() === name + ' Galleries';}).parent().find('a');
    writeAll($links, $, ws);
    ws.end(function () {
        console.log('Done.');
        next();
    });
});

function writeAll($links, $, ws) {
    $links.each(function () {
        ws.write($(this).attr('href') + '\n');
    });
}
