var path = require('path');

var express = require('express');
var sassMiddleware = require('node-sass-middleware');

var app = express();

app.use('/', require('./app-client'));
app.use('/curator', express.static(path.resolve(__dirname, 'curator')));
app.use('/api', require('./api'));
app.use(sassMiddleware({
    src: path.join(__dirname, 'stylesheets'),
    dest: path.join(__dirname, 'public', 'css-dist'),
    debug: true,
    outputStyle: 'compressed'//,
    // prefix:  '/prefix'  // Where prefix is at <link rel="stylesheets" href="prefix/style.css"/>
    , prefix: '/css'
}));
app.use(express.static(path.join(__dirname, 'public')));

app.listen('9000');
