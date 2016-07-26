var stream = require('stream');
var url = require('url');
var util = require('util');

var cheerio = require('cheerio');

function LinkExtractor(selector) {
    stream.Transform.call(this, {objectMode: true});
    this._selector = selector;
}
util.inherits(LinkExtractor, stream.Transform);
LinkExtractor.prototype._transform = function (page, encoding, callback) {
    var $;
    if (typeof page === 'string') {
        $ = cheerio.load(page);
    } else if ('$' in page) {
        $ = page.$;
    } else {
        $ = cheerio.load(page.doc);
    }
    var $links = $(this._selector);
    var base = page.url || '';
    $links.each((i, a) => {
        var href = $(a).attr('href');
        var link = {url: url.resolve(base, href)};
        if ('source' in page) {
            link.source = page.source;
        }
        if ('slug' in page) {
            link.slug = page.slug;
        }
        this.push(link);
    });
    callback();
};

module.exports = LinkExtractor;