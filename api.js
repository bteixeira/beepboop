var pg = require('pg');
var http = require('http');
var connString = 'postgres://brains:brains@localhost/beepboob';

pg.connect(connString, function (err, client, done) {
    if (err) {
        return console.error('could not connect to postgres', err);
    }

    client.query('SELECT * FROM models order by name', [], function(err, result) {
        //call `done()` to release the client back to the pool
        done();

        if (err) {
            return console.error('error running query', err);
        }
        //console.log(result.rows);
        //console.log(result);
        //output: 1
        client.end();

        result.rows.forEach(function (row) {
            console.log(row.name);
        });

        http.createServer(function (req, res) {

            var data = shuffle(result.rows.slice()).slice(0, 20);
            res.writeHead(200, {'Content-Type': 'application/json'});
            res.end(JSON.stringify(data));

        }).listen(9009);

        //console.log(rows.length);
        //console.log(result.rows);
        //Object.keys(result.rows).each(console.log);

    });

});


function shuffle(array) {
    var currentIndex = array.length, temporaryValue, randomIndex;
    // While there remain elements to shuffle...
    while (0 !== currentIndex) {

        // Pick a remaining element...
        randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex -= 1;

        // And swap it with the current element.
        temporaryValue = array[currentIndex];
        array[currentIndex] = array[randomIndex];
        array[randomIndex] = temporaryValue;
    }

    return array;
}