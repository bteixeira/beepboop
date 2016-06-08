var diskdb = require('./diskdb-custom');

var conn = diskdb.connect('./data/storage/diskdb', ['models']);

console.log(conn.models.find());
