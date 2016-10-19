var fs = require('fs');

var graphics = require('gm');

var utils = require('../utils');

var MongoClient = require('mongodb').MongoClient;
var ObjectID = require('mongodb').ObjectID;
var URL = 'mongodb://localhost:27017/beepboop';

function MongoDBConnection(db) {
	this._connection = db;
	this._models = db.collection('models');
	this._images = db.collection('images');
	this._users = db.collection('users');
	this._guesses = db.collection('guesses');
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
		{
			$lookup: {
				from: 'models',
				localField: 'slug',
				foreignField: 'slug',
				as: '_model'
			}
		},
		{$unwind: '$_model'},
		{$skip: skip},
		{$limit: 1}
	], (err, images) => {
		callback(err, images && images[0]);
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

MongoDBConnection.prototype.getRandomCuratedImages = function (metadataQuery, size, callback) {
	if (typeof size !== 'number') {
		throw '"size" argument must be a number';
	}

	var query = {
		metadata: {$exists: true},
		'metadata.crop': {$exists: true}
	};

	if (metadataQuery) {
		Object.keys(metadataQuery).forEach(p => {
			var v = metadataQuery[p];
			if (typeof v === 'object' && 'length' in v) {
				query['metadata.' + p] = {$in: v};
			} else {
				query['metadata.' + p] = String(v);
			}
		});
	}

	console.log('SIZE  IS', size);
	console.log('QUERY IS', query);

	this._images.aggregate([
		{$match: query},
		{$sample: {size: size}}
	]).toArray(callback);
};

MongoDBConnection.prototype.findImageById = function (id, callback) {
	this._images.find({_id: new ObjectID(id)}).limit(1).next(callback);
};

MongoDBConnection.prototype.findModelByImage = function (image, callback) {
	this._models.find({source: image.source, slug: image.slug}).limit(1).next(callback);
};

MongoDBConnection.prototype.findUserByName = function (name, callback) {
	this._users.find({name: name}).limit(1).next(callback);
};

MongoDBConnection.prototype.insertUser = function (user, callback) {
	this._users.insertOne(user, callback);
};

MongoDBConnection.prototype.incrementUserCredits = function (user, increment, callback) {
	this._users.findOneAndUpdate(
		{name: user.name},
		{$inc: {credits: increment}},
		{returnOriginal: false},
		(err, result) => {
			console.log('incremented', result);
			callback(err, result.value)
		}
	);
};

MongoDBConnection.prototype.insertGuess = function (guess, callback) {
	this._guesses.insertOne(guess, callback);
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
