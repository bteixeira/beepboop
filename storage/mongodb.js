var fs = require('fs');

var graphics = require('gm');

var utils = require('../utils');

var MongoClient = require('mongodb').MongoClient;
var URL = 'mongodb://localhost:27017/beepboop';


function MongoDBConnection(db) {
    this._connection = db;
    this._models = db.collection('models');
    this._images = db.collection('images');
}

MongoDBConnection.prototype.addOrUpdateModel = function (model, callback) {

    // TODO ASSERT THAT DATA IS IN CORRECT FORMAT

    this._models.findOneAndUpdate({
        source: model.source,
        slug: model.slug
    }, {
        $set: model
    }, {
        upsert: true
    }, function (error, result) {
        if (error) {
            callback(error, null);
        } else {
            callback(null, result.value);
        }
    });
};

MongoDBConnection.prototype.getModel = function (source, slug, callback) {
    this._models.find({source: source, slug: slug}).limit(1).next(callback);
};

MongoDBConnection.prototype.expireModels = function (timestamp, callback) {
    if (typeof timestamp !== 'number') {
        timestamp = timestamp.getTime();
    }

    this._models.find({revision: {$lt: timestamp}}).toArray((err, models) => {
        if (err) {
            callback(err, null);
            return;
        }
        // TODO NOT SAFE FOR CONCURRENCY
        this._models.deleteMany({revision: {$lt: timestamp}});
        callback(null, models);
    });

};

MongoDBConnection.prototype.addOrUpdateImage = function (image, callback) {

    // TODO ASSERT THAT DATA IS IN CORRECT FORMAT
    // TODO MAKE SURE SLUG AND SOURCE ARE STILL THE SAME

    this._images.findOneAndUpdate({
        hash: image.hash
    }, {
        $set: image
    }, {
        upsert: true
    }, function (error, result) {
        if (error) {
            callback(error, null);
        } else {
            callback(null, result.value);
        }
    });
};

MongoDBConnection.prototype.expireImages = function (timestamp, callback) {
    if (typeof timestamp !== 'number') {
        timestamp = timestamp.getTime();
    }

    // FIXME MAKE SURE IMAGES IS PRESENT
    this._images.find({revision: {$lt: timestamp}}).toArray((err, images) => {
        if (err) {
            callback(err, null);
            return;
        }
        // TODO NOT SAFE FOR CONCURRENCY
        this._images.deleteMany({revision: {$lt: timestamp}});
        callback(null, images);
    });
};

MongoDBConnection.prototype.findImageByUrl = function (url, callback) {
    this._images.find({url: url}).limit(1).next(callback);
};

MongoDBConnection.prototype.updateImageRevisionByUrl = function (img, callback) {
    console.log('setting revision to', img.revision);
    this._images.updateOne({url: img.url}, {$set: {revision: img.revision}}, callback);
};

MongoDBConnection.prototype.findUncuratedImage = function (query, skip, callback) {
    if (typeof skip !== 'number' || skip < 0) {
        skip = 0;
    }

    this._images.aggregate([
        // TODO THIS AGGREGATION ONLY WORKS WITH A SINGLE SOURCE. IF WE WANNA USE MONGO IN A RELATIONAL MANNER, THE FOREIGN KEY MUST BE A SINGLE FIELD (CONSIDER HAVING A SINGLE FIELD WITH 'SOURCE:SLUG')
        {$match: {metadata: {$exists: false}}},
        {$lookup: {
            from: 'models',
            localField: 'slug',
            foreignField: 'slug',
            as: '_model'
        }},
        {$unwind: '$_model'},
        {$limit: 1}
    ], (err, images) => {
        callback(err, images[0]);
    });

};

MongoDBConnection.prototype.addImageMetadata = function (hash, metadata, callback) {
    console.log('Changing image ' + hash + ':', metadata);
    this._images.updateOne({hash: hash}, {$set: {metadata: metadata}}, callback);
};

MongoDBConnection.prototype.getRandomCroppedImage = function (parameters, callback) {
    var query = {
        metadata: {$exists: true},
        'metadata.crop': {$exists: true}
    };

    if (parameters) {
        Object.keys(parameters).forEach(p => {
            query['metadata.' + p] = parameters[p];
        });
    }

    this._images.aggregate([{$match: query}, {$sample: {size: 1}}]).next((err, image) => {
        if (err) {
            throw err;
        }
        if (!image) {
            callback('No images found for query', null);
            return;
        }

        // TODO FILE ACCESS AND IMAGE CROPPING SHOULD NOT BE IN THE DATABASE DRIVER!!!

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
                            throw err;
                        }
                        utils.justWrite(filename, buffer);
                        // console.log('the buffer has', buffer.length, 'bytes');
                        callback(null, {
                            image: image,
                            cropped: buffer
                        });
                });
            } else {
                console.log('file found, streaming');
                callback(null, {
                    image: image,
                    cropped: contents
                });
            }
        });
    });

};

MongoDBConnection.prototype.close = function (callback) {
    this._connection.close(false, callback);
};

module.exports = {
    getConnection: function (opts, callback) {

        MongoClient.connect(URL, function (err, db) {
            if (err) {
                callback(err, null);
            } else {
                callback(null, new MongoDBConnection(db));
            }
        });

    }
};
