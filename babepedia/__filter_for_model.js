var stream = require('stream');
var util = require('util');

var storage = require('../storage/default');
var utils = require('../utils');

var logger = utils.getLogger('FilterForModel');

function FilterForModel() {
	stream.Transform.call(this, {objectMode: true});
	storage.getConnection(null, (err, db) => {
		if (err) {
			throw err;
		}
		this._db = db;
		if (this._waiting) {
			db.getModel(this._waiting.source, this._waiting.slug, (err, model) => {
				if (model) {
					this.push(this._waiting);
				} else {
					logger.info('Skipping image, no model: ' + this._waiting.url);
				}
				this._waitingCB();
				this._waiting = null;
				this._waitingCB = null;
			});
		}

		this.on('finish', () => {
			this._db.close();
		});

	});
}
util.inherits(FilterForModel, stream.Transform);

FilterForModel.prototype._transform = function (image, encoding, callback) {
	if (!this._db) {
		this._waiting = image;
		this._waitingCB = callback;
	} else {
		this._db.getModel(image.source, image.slug, (err, model) => {
			if (model) {
				this.push(image);
			} else {
				logger.info('Skipping image, no model: ' + image.url);
			}
			callback();
		});
	}
};

module.exports = FilterForModel;
