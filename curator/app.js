var express = require('express');

var app = express();

app.get('/', function (req, res) {
    res.send('yeah, all okay');
});

app.use('/api', require('./api'));

app.listen('9000');
