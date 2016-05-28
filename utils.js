var request = require('request');
var fs = require('fs');

var cheerio = require('cheerio');

function logger (msg) {
    console.log(new Date(), msg);
}

function noop() {}

module.exports = {
    readAll: function (stream, callback) {
        if (typeof stream === 'string') {
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
    readEachLine: function (stream, callback, verbose, end) {
        if (typeof stream === 'string') {
            stream = fs.createReadStream(stream);
        }
        var chunks = [];
        stream.on('data', function (data) {
            chunks.push(data);
        }).on('end', function () {
            var content = chunks.map(String).join('');
            var lines = content.split('\n');
            var line;
            var i = 0;
            function process() {
                if (i >= lines.length) {
                    verbose && console.log('All work done.');
                    return end && end();
                }
                line = lines[i++];
                callback(line, process);
            }
            //callback(content);
            process();
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
    },
    fetchAndDump: function fetchAndDump (url, filename, callback, verbose) {
        var log = verbose ? logger : noop;
        log('Getting "' + url + '"...');
        request.get({uri: url, timeout: 15000}).on('response', function (res) {
            log('Receiving, dumping to "' + filename + '"...');
            var ws = fs.createWriteStream(filename);
            res.pipe(ws);
            res.on('end', function () {
                log('Got it.');
                callback();
            });
        }).on('error', function (error) {
            console.error(error);
            fetchAndDump(url, filename, callback, verbose);
        });
    },
    fetch: function fetch (url, callback) {
        request(url, function (err, res, body) {
            if (err) {
                throw err;
            }
            var $ = cheerio.load(body);
            callback($);
        });
    }
};
