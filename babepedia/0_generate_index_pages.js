var stream = require('stream');
var url = require('url');

var AlphabetGenerator = require('./__alphabet_generator');
var LineOutputter = require('./__line_outputter');
var SimpleAppender = require('./__simple_appender');


function BabepediaSlugger() {
}
BabepediaSlugger.prototype = new stream.Transform({objectMode: true});
BabepediaSlugger.prototype._transform = function (slug, encoding, callback) {
    this.push(url.format({
        protocol: 'http',
        host: 'www.babepedia.com',
        pathname: slug
    }));
    callback();
};

new AlphabetGenerator()
    .pipe(new SimpleAppender('index/'))
    .pipe(new BabepediaSlugger())
    .pipe(new LineOutputter());
