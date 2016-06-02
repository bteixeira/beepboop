var stream = require('stream');
var util = require('util');

var MongoClient = require('mongodb').MongoClient;

var URL = 'mongodb://localhost:27017/beepboop';

function ModelFeeder() {
    stream.Writable.call(this, {objectMode: true});

    MongoClient.connect(URL, (err, db) => {
        if (err) {
            throw err;
        }
        this._collection = db.collection('models');
        if (this._waiting) {
            this._collection.insertOne(this._waiting, null, this._waitingCB);
            this._waiting = null;
        }
        this.on('finish', () => db.close());
    });
}
util.inherits(ModelFeeder, stream.Writable);

ModelFeeder.prototype._write = function (model, encoding, callback) {
    if (!this._collection) {
        this._waiting = model;
        this._waitingCB = callback;
    } else {
        this._collection.insertOne(model, null, callback);
    }
};

module.exports = ModelFeeder;
