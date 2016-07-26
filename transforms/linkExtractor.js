var stream = require('stream');
var url = require('url');
var util = require('util');

var cheerio = require('cheerio');

function LinkExtractor(selector) {
    stream.Transform.call(this, {objectMode: true});
    this._selector = selector;
}
util.inherits(LinkExtractor, stream.Transform);
LinkExtractor.prototype._transform = function (doc, encoding, callback) {
    var $;
    if (typeof doc === 'string') {
        $ = cheerio.load(doc);
    } else if ('$' in doc) {
        $ = doc.$;
    } else {
        $ = cheerio.load(doc.html);
    }
    var $links = $(this._selector);
    $links.each((i, a) => {
        this.push($(a).attr('href'));
    });
    callback();
};

module.exports = LinkExtractor;