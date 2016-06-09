var diskdb = require('./diskdb-custom');

conn = diskdb.connect('./data/storage/diskdb', ['models', 'images']);

examples = function () {
    console.log(`
Access Data
Examples:

    conn.models.find()
    conn.images.find({source: 'babepedia'})

`);
};
examples();

require('repl').start({useGlobal: true});