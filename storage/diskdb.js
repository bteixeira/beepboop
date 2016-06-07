var diskdb = require('../diskdb-custom');
var mkpath = require('mkpath');


const DATA_DIR = '../data/storage/diskdb';

function DiskdbConnection () {
    mkpath.sync(DATA_DIR);
    this._connection = diskdb.connect(DATA_DIR, ['models']);
}

DiskdbConnection.prototype.addOrUpdateModel = function (model, callback) {
    //this._connection.models.save(model);

    // TODO ASSERT THAT DATA IS IN CORRECT FORMAT
    var stats = this._connection.models.update(
        (m) => {
            return m.source === model.source && m.slug === model.slug;
        },
        model,
        {
            upsert: true
        }
    );
    console.log('Model upserted, issuing callback');
    callback(null, stats);
};

DiskdbConnection.prototype.close = function () {
};

module.exports = {
    getConnection: function (opts, callback) {
        callback(null, new DiskdbConnection());
    }
};
