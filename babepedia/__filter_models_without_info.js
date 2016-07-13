var stream = require('stream');
var util = require('util');

var cheerio = require('cheerio');

function FilterModelsWithoutInfo() {
    stream.Transform.call(this, {objectMode: true});
}
util.inherits(FilterModelsWithoutInfo, stream.Transform);

FilterModelsWithoutInfo.prototype._transform = function (page, encoding, callback) {
    var html = page.doc;
    var $ = cheerio.load(html);

    var hasInfo = false;

    $('#bioarea ul li').each((i, li) => {
        var $li = $(li);
        var $label = $li.find('.label');
        var label = $label.text();
        var match = label.match(/(.+?)\:?$/);
        if (match) {
            label = match[1];
        }
        if (label === 'Boobs') {
            hasInfo = true;
        }
    });

    if (hasInfo) {
        this.push(page);
    } else {
        console.log(`Page ${page.url} discarded, no enhancement information`);
    }
    callback();
};

module.exports = FilterModelsWithoutInfo;
