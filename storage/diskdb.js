var mkpath = require('mkpath');

var diskdb = require('../diskdb-custom');
var utils = require('../utils');

const DATA_DIR = utils.getDataPath('storage/diskdb');

function DiskdbConnection () {
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
    var image = this._connection.images.findOne(img => !('metadata' in img) || !Object.keys(img.metadata).length);
    callback(null, image);
};

DiskdbConnection.prototype.close = function () {
};

module.exports = {
    getConnection: function (opts, callback) {
        callback(null, new DiskdbConnection());
    }
};
