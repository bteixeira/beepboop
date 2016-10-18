var stream = require('stream');
var util = require('util');

var request = require('request');

var storage = require('../storage/default');

function ImageFetcher(source) {
	stream.Transform.call(this, {objectMode: true});
	this._source = source;

	storage.getConnection(null, (err, db) => {
		if (err) {
			throw err;
		}
		this._db = db;
		if (this._waiting) {
			this.process(this._waiting, this._waitingCB);
			this._waiting = this._waitingCB = null;
		}
	});

	this.on('finish', () => {
		this._db && this._db.close();
	});
}

util.inherits(ImageFetcher, stream.Transform);

ImageFetcher.prototype._process = function (img, callback) {
	this._db.findImageByUrl(img.url, (err, image) => {
		var headers = {};
		if (image) {
			console.log('THERE IS ALREADY AN IMAGE, CHECKING IF UPDATED', img.url);
			headers['If-Modified-Since'] = new Date(image.revision).toUTCString();
		}

		console.log(headers);
		request({
			uri: img.url,
			encoding: null,
			headers: headers
		}, (err, res, body) => {

			if (err) {
				callback(err, null);
			} else if (res.statusCode === 304) {
				console.log('RECEIVED 304!', img.url);
				this._db.updateImageRevisionByUrl(img, (err, result) => {
					callback(err);
				});
			} else {
				console.log('RECEIVED ANOTHER CODE, PASSING', res.statusCode);
				img = Object.assign({}, img, {content: body});
				img.source = this._source;
				this.push(img);
				callback();
			}

		});
	});
};

ImageFetcher.prototype._transform = function (img, encoding, callback) {


	if (this._db) {
		this._process(img, callback);
	} else {
		this._waiting = img;
		this._waitingCB = callback;
	}
};

module.exports = ImageFetcher;
