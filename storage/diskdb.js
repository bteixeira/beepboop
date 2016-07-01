var fs = require('fs');

var gm = require('gm');
var mkpath = require('mkpath');

var diskdb = require('../diskdb-custom');
var utils = require('../utils');

const DATA_DIR = utils.getDataPath('storage/diskdb');

function DiskdbConnection() {
    mkpath.sync(DATA_DIR);
    this._connection = diskdb.connect(DATA_DIR, ['models', 'images']);
}

DiskdbConnection.prototype.addOrUpdateModel = function (model, callback) {

    // TODO ASSERT THAT DATA IS IN CORRECT FORMAT

    var old = this._connection.models.find(m =>
        m.source === model.source && m.slug === model.slug
    );

    old = old[0];

    this._connection.models.update(
        (m) => {
            return m.source === model.source && m.slug === model.slug;
        },
        model,
        {
            upsert: true
        }
    );
    callback(null, old);
};

DiskdbConnection.prototype.getModel = function (source, slug, callback) {
    var model = this._connection.models.findOne(m => {
        return m.source === source && m.slug === slug;
    });
    // console.log('looking for', source, slug, 'found:', model);
    callback(null, model);
};

DiskdbConnection.prototype.expireModels = function (timestamp, callback) {
    if (typeof timestamp !== 'number') {
        timestamp = timestamp.getTime();
    }
    var models = this._connection.models.find(entry => entry.revision < timestamp);
    this._connection.models.remove(entry => entry.revision < timestamp);
    callback(models);
};

DiskdbConnection.prototype.addOrUpdateImage = function (image, callback) {

    // TODO ASSERT THAT DATA IS IN CORRECT FORMAT

    var old = this._connection.images.find({hash: image.hash});

    old = old[0];

    // TODO MAKE SURE SLUG AND SOURCE ARE STILL THE SAME

    if (old) {
        old.revision = image.revision;
        this._connection.images.update({hash: old.hash}, old);
    } else {
        this._connection.images.save(image);
    }

    callback(null, old);
};

DiskdbConnection.prototype.expireImages = function (timestamp, callback) {
    if (typeof timestamp !== 'number') {
        timestamp = timestamp.getTime();
    }
    var images = this._connection.images.find(entry => entry.revision < timestamp);
    this._connection.images.remove(entry => entry.revision < timestamp);
    callback(images);
};

DiskdbConnection.prototype.findUncuratedImage = function (callback) {
    var image = this._connection.images.findOne(img =>
        (
            !('metadata' in img) || !Object.keys(img.metadata).length
        ) && (
            this._connection.models.findOne(m => m.source === img.source && m.slug === img.slug)
        )
    );
    callback(null, image);
};

DiskdbConnection.prototype.addImageMetadata = function (hash, metadata, callback) {
    console.log('Changing image ' + hash + ':', metadata);
    this._connection.images.update({hash: hash}, {metadata: metadata}, {multi: false});
    callback();
};

DiskdbConnection.prototype.getRandomCroppedImage = function (query, callback) {
    var images = this._connection.images.find(img => {
        if (!('metadata' in img) || !('crop' in img.metadata)) {
            return false;
        }

        if (!query) {
            return true;
        }

        for (var p in query) {
            if (img.metadata[p] !== query[p]) {
                return false;
            }
        }
        return true;
    });

    if (!images.length) {
        throw 'No images found for query';
    }

    var i = Math.floor(Math.random() * images.length);
    var image = images[i];

    // console.log('this is the image', image);

    var filename = utils.getFullCroppedPath(image);
    // console.log('reading file:', filename);
    fs.readFile(filename, (err, contents) => {
        if (err) {
            // file does not exist, create
            console.log('file does not exist, cropping');
            gm(utils.getFullSinglePath(image))
                .crop(image.metadata.crop.w, image.metadata.crop.h, image.metadata.crop.x, image.metadata.crop.y)
                .toBuffer((err, buffer) => {
                    if (err) {
                        throw err;
                    }
                    utils.justWrite(filename, buffer);
                    // console.log('the buffer has', buffer.length, 'bytes');
                    callback({
                        image: image,
                        cropped: buffer
                    });
                });
        } else {
            console.log('file found, streaming');
            callback({
                image: image,
                cropped: contents
            });
        }
    });
};

DiskdbConnection.prototype.close = function () {
};

module.exports = {
    getConnection: function (opts, callback) {
        callback(null, new DiskdbConnection());
    }
};
