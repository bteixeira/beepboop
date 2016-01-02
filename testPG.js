var pg = require('pg');

var connString = 'postgres://brains:brains@localhost/beepboob';

pg.connect(connString, function (err, client, done) {
    if (err) {
        return console.error('could not connect to postgres', err);
    }

    client.query('SELECT * FROM models', [], function(err, result) {
        //call `done()` to release the client back to the pool
        done();

        if (err) {
            return console.error('error running query', err);
        }
        console.log(result.rows);
        //console.log(result);
        //output: 1

        client.end();
    });

});
