var path = require('path');

var lowdb = require('lowdb');
var mkpath = require('mkpath');


const DATA_DIR = './data/storage/lowdb';

function DiskdbConnection() {
	mkpath.sync(DATA_DIR);
	var filename = path.resolve(DATA_DIR, 'models.json');
	this._connection = low(filename, {storage: require('lowdb/lib/file-async')});
}

DiskdbConnection.prototype.addOrUpdateModel = function (model) {
	// TODO ASSERT THAT DATA IS IN CORRECT FORMAT
	this._connection
		.get('models')
		.filter(m => {
			return m.source === model.source && m.slug === model.slug;
		})
};

DiskdbConnection.prototype.close = function () {

};

module.exports = {
	getConnection: function () {
		return new DiskdbConnection();
	}
};
