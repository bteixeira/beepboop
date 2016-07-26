var fs = require('fs');
var path = require('path');
var stream = require('stream');

var bunyan = require('bunyan');
var cheerio = require('cheerio');
var graphics = require('gm');
var mkpath = require('mkpath');
var request = require('request');

function logger (msg) {
    console.log(new Date(), msg);
}

function noop() {}

const DATA_PATH = path.resolve(__dirname, 'data');

var utils = module.exports = {
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
    },
    justWrite: function (filename, data, callback) {
        var dir = path.dirname(filename);
        mkpath(dir, function(err) {
            if (err) {
                if (callback) {
                    return callback(err);
                } else {
                    throw err;
                }
            }
            fs.writeFile(filename, data, callback);
        });

    },
    expireFiles: function (options) {
        var logger = utils.getLogger('Expire Files');
        mkpath.sync(options.target);
        fs.readdir(options.origin, (err, files) => {
            logger.debug('Files read');
            files = files.map(f => path.resolve(options.origin, f));
            var n = 0;
            for (var file of files) {
                var stats = fs.statSync(file);
                if (stats.mtime < options.timestamp) {
                    logger.debug(`Moving file: ${file}`);
                    fs.renameSync(file, path.resolve(options.target, path.basename(file)));
                    n += 1;
                } else {
                    logger.debug(`File is not old: ${file}`);
                }
            }
            logger.info(`Expired ${n} files into ${options.target}`);
            if (options.done) {
                options.done();
            }
        });
    },
    getDataPath: function (...components) {
        components.unshift(DATA_PATH);
        return path.resolve.apply(null, components);
    },
    getFullSinglePath: function (image) {
        return this.getDataPath(image.source, 'singles_raw', image.slug[0].toUpperCase(), image.slug, image.hash + '_' + image.filename);
    },
    getFullCroppedPath: function (image) {
        return this.getDataPath(image.source, 'singles_crop', image.hash + path.extname(image.filename));
    },
    getCroppedContent: function (image, callback) {
        var filename = utils.getFullCroppedPath(image);
        fs.readFile(filename, (err, contents) => {
            if (err) {
                // file does not exist, create
                console.log('file does not exist, cropping');
                graphics(utils.getFullSinglePath(image))
                .crop(
                    image.metadata.crop.w,
                    image.metadata.crop.h,
                    image.metadata.crop.x,
                    image.metadata.crop.y
                ).toBuffer((err, buffer) => {
                    if (err) {
                        return callback(err);
                    }
                    utils.justWrite(filename, buffer);
                    // console.log('the buffer has', buffer.length, 'bytes');
                    callback(null, buffer);
                });
            } else {
                console.log('file found, streaming');
                callback(null, contents);
            }
        });
    },
    getFullContent: function (image, callback) {
        var filename = utils.getFullSinglePath(image);
        fs.readFile(filename, callback);
    },
    getLogger: function (name) {
        var formatter = new stream.Transform({
            objectMode: true,
            transform: function (chunk, encoding, callback) {
                var line = formatLog(chunk);
                callback(null, line);
            }
        });
        formatter.pipe(process.stdout);

        var logger = bunyan.createLogger({
            name: name,
            // TODO LOOK UP OPTIONS FOR EACH NAME
            level: 'info',
            stream: formatter
        });

        return logger;
    }
};

function formatLog(line) {
    line = JSON.parse(line);
    return `${line.time} ${bunyan.nameFromLevel[line.level].toUpperCase()} [${line.name}] ${line.msg}\n`;
}