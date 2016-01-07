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
                fs.createWriteStream(__dirname + '/pages/' + slug + '.htm').end(content);
            getIt();
        }, true);
    }

    getIt();
});
