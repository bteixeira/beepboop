var path = require('path');

var express = require('express');

var app = express();

app.use('/', express.static(path.resolve(__dirname, 'client')));
app.use('/curator', express.static(path.resolve(__dirname, 'curator')));

app.use('/api', require('./api'));

app.use(express.static(path.resolve(__dirname, 'public')));

app.listen('9000');
