var stream = require('stream');
var util = require('util');

var storage = require('../storage/default');

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
        this.on('finish', () => {
            db.expireModels(timestamp, (err, models) => {
                for (var model of models) {
                    console.log('[EVENT LOG] [MODEL REMOVED] ' + model.slug, model);
                }
                db.close();
            });

        });

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
        this._db.addOrUpdateModel(model, (err, old) => {
            if (err) {
                callback(err);
            } else {
                if (!old) {
                    console.log('[EVENT LOG] [MODEL INSERTED] ' + model.slug + ' ' + model);
                } else {
                    var diff = objDiff(old.attributes, model.attributes);
                    if (diff) {
                        console.log('[EVENT LOG] [MODEL UPDATED] ' + model.slug + ' ' + JSON.stringify(diff));
                    }
                }

                callback();
            }
        });
    }
};

module.exports = ModelFeeder;


function objDiff (a, b) {

    var result = {};

    for (var p of Object.keys(a)) {
        if (!(p in b)) {
            result[p] = 'ADD';
        } else {
            if (typeof a[p] === 'object' && typeof b[p] === 'object') {
                var subDiff = objDiff(a[p], b[p]);
                if (subDiff) {
                    result[p] = subDiff;
                }
            } else if (a[p] !== b[p]) {
                result[p] = {FROM: a[p], TO: b[p]};
            }
        }
    }

    for (p of Object.keys(b)) {
        if (!(p in a)) {
            result[p] = 'REMOVE';
        }
    }

    if (Object.keys(result).length) {
        return result;
    }

    return null;

}