var request = require('request');
var fs = require('fs');

function logger (msg) {
    console.log(new Date(), msg);
}

function noop() {}

module.exports = {
    readAll: function (stream, callback) {
        if (typeof stream === 'String') {
            stream = fs.createReadStream(stream);
        }
        var chunks = [];
        stream.on('data', function (data) {
            chunks.push(data);
        }).on('end', function () {
            var content = chunks.map(String).join('');
            callback(content);
        });
    },
    fetchPage: function fetchPage (url, callback, verbose) {
        var log = verbose ? logger : noop;
        log('Getting "' + url + '"...');
        request.get({uri: url, timeout: 15000}).on('response', function (res) {
            log('Receiving...');
            var chunks = [];
            res.on('data', function (data) {
                log('Got a chunk...');
                chunks.push(data.toString());
            }).on('end', function () {
                log('Got it.');
                var text = chunks.join('');
                callback(text);
            });
        }).on('error', function (error) {
            console.error(error);
            fetchPage(url, callback, verbose);
        });
    }
};
