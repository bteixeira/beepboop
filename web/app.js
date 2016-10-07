var path = require('path');

var express = require('express');
var sassMiddleware = require('node-sass-middleware');

var app = express();

app.use('/', require('./app-client'));
app.use('/curator', express.static(path.resolve(__dirname, 'curator')));
app.use('/api', require('./api'));
app.use(sassMiddleware({
    src: path.join(__dirname, 'stylesheets'),
    dest: path.join(__dirname, 'public', 'css'),
    debug: true,
    outputStyle: 'compressed',
    prefix: '/css' // Where prefix is at <link rel="stylesheets" href="prefix/style.css"/>
}));
app.use(express.static(path.join(__dirname, 'public')));

app.listen('9000');
