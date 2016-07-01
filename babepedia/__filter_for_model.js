var stream = require('stream');
var util = require('util');

var storage = require('../storage/diskdb');

function FilterForModel() {
    stream.Transform.call(this, {objectMode: true});
    storage.getConnection(null, (err, db) => {
        if (err) {
            throw err;
        }
        this._db = db;
        if (this._waiting) {
            db.getModel(this._waiting.source, this._waiting.slug, model => {
                if (model) {
                    this.push(_waiting);
                }
                this._waitingCB();
            });
            this._waiting = null;
            this._waitingCB = null;
        }

    });
}
util.inherits(FilterForModel, stream.Transform);

FilterForModel.prototype._transform = function (image, encoding, callback) {
    if (!this._db) {
        this._waiting = image;
        this._waitingCB = callback;
    } else {
        db.getModel(image.source, image.slug, model => {
            if (model) {
                this.push(image);
            } else {
                console.log('skipping image, no model')
            }
            callback();
        });
    }
};

module.exports = FilterForModel;
