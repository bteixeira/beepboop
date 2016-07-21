var crypto = require('crypto');
var fs = require('fs');
var stream = require('stream');
var util = require('util');

var utils = require('../utils');
var storage = require('../storage/default');

function ImageFeed(timestamp) {
    stream.Writable.call(this, {objectMode: true});

    if (typeof timestamp === 'undefined') {
        timestamp = Date.now();
    }
    this._timestamp = timestamp;

    storage.getConnection(null, (err, db) => {
        if (err) {
            throw err;
        }
        this._db = db;
        if (this._waiting) {
            db.addOrUpdateImage(this._waiting, this._waitingCB);
            this._waiting = null;
        }
        this.on('finish', () => {
            db.expireImages(timestamp, (err, images) => {
                if (err) {
                    throw err;
                }
                for (var image of images) {
                    console.log('[EVENT LOG] [IMAGE REMOVED] ' + image.filename);
                }
                db.close();
            });

        });

    });
}
util.inherits(ImageFeed, stream.Transform);

ImageFeed.prototype._write = function (image, encoding, callback) {
    // TODO ASSERT DATA IN RIGHT FORMAT

    var sha256 = crypto.createHash('sha256');
    sha256.update(image.content);
    var digest = sha256.digest(); // byte buffer
    image.hash = digest.toString('hex');

    image.revision = this._timestamp;
    image.deleted = false;

    image.filename = image.url.slice(image.url.lastIndexOf('/') + 1);

    var content = image.content;
    delete image.content;

    if (!this._db) {
        this._waiting = image;
        this._waitingCB = callback;
    } else {
        this._db.addOrUpdateImage(image, (err, old) => {
            if (err) {
                callback(err);
            } else {
                if (!old) {
                    console.log('[EVENT LOG] [IMAGE INSERTED] ' + image.filename);
                    var filepath = utils.getFullSinglePath(image);
                    console.log(`Trying to write to ${filepath}`);
                    utils.justWrite(filepath, content);
                } else {
                    console.log('[EVENT LOG] [IMAGE UPDATED] ' + old.filename + ' ' + old.revision);
                    // TODO IF FILENAME CHANGED WE HAVE TO RENAME THE FILE, OTHERWISE WE CAN NEVER FIND IT! THIS ACTUALLY HAPPENED
                }
                callback();
            }
        });
    }
};

module.exports = ImageFeed;
