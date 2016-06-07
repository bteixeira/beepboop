var fs = require('fs');
var path = require('path');

var diskdb = require('diskdb');
var mkpath = require('mkpath');


const DATA_DIR = './data/storage';

function DiskdbConnection () {
    mkpath.sync(DATA_DIR);

    this._data = ;
}

DiskdbConnection.prototype.addOrUpdateModel = function (model) {
    //this._connection.models.save(model);

    // TODO ASSERT THAT DATA IS IN CORRECT FORMAT
    return this._connection.models.update(
        {
            source: model.source,
            slug: model.slug
        },
        model,
        {
            upsert: true
        }
    )
};

DiskdbConnection.prototype.close = function () {

};

module.exports = {
    getConnection: function () {
        return new DiskdbConnection();
    }
};
