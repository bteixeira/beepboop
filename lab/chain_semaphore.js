var fs = require('fs');

var semaphore = require('semaphore');
var sem = semaphore(2);

var Generator = require('./1_generator');
var Fetcher = (function () {
    var util = require('util');
    var stream = require('stream');
    var request = require('request');

    function Fetcher() {
        stream.Transform.call(this, {objectMode: true});
    }
    util.inherits(Fetcher, stream.Transform);
    Fetcher.prototype._transform = function (url, encoding, callback) {
        sem.take(() => {
            console.log(`Fetching ${url}`);
            request.get(url, (err, req, data) => {
                if (err) {
                    this.emit('error', err);
                } else {
                    this.push({
                        url: url,
                        data: data
                    });
                }
                sem.leave();
            });
            callback();
        });
    };

    return Fetcher;

}());
var JSONifier = require('./3_JSONify_anything');

new Generator()
    .pipe(new Fetcher())
    .pipe(new JSONifier(4))
    .pipe(fs.createWriteStream('./dump.json'));
