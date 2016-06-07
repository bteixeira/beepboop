var stream = require('stream');
var util = require('util');

var storage = require('../storage/diskdb');

function ModelFeeder(timestamp) {
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
            db.addOrUpdateModel(this._waiting, this._waitingCB);
            this._waiting = null;
        }
        this.on('finish', () => db.close());

    });
}
util.inherits(ModelFeeder, stream.Writable);

ModelFeeder.prototype._write = function (model, encoding, callback) {

    // TODO ASSERT MODEL DATA IN RIGHT FORMAT

    model.revision = this._timestamp;

    if (!this._db) {
        this._waiting = model;
        this._waitingCB = callback;
    } else {
        this._db.addOrUpdateModel(model, callback);
    }
};

module.exports = ModelFeeder;
