var path = require('path');

var express = require('express');
var session = require('express-session');
var bodyParser = require('body-parser');

var app = express();

var users = {};

app.set('view engine', 'pug');
app.set('views', path.resolve(__dirname, 'views'));
app.use(session({
	resave: false,
	saveUninitialized: false,
	secret: 'CANJA-DE-GALINHA'
}));
app.use(bodyParser.urlencoded({extended: true}));

app.get('/', function (req, res) {
	if (req.session.name) {
		res.redirect('/dashboard');
	} else {
		res.render('intro', {});
	}
});

app.post('/login', function (req, res) {
	var name = req.body.name;
	if (name) {
		if (!(name in users)) {
			users[name] = {
				name: name,
				credits: 1
			};
		}
		req.session.user = users[name];
		res.redirect('/dashboard');
	} else {
		res.redirect('/');
	}
});

app.get('/logout', function (req, res) {
	if (req.session.user) {
		req.session.destroy(() => {
			res.redirect('/');
		});
	} else {
		res.redirect('/');
	}
});

app.get('/dashboard', function (req, res) {
	if (!req.session.user) {
		res.redirect('/');
	} else {
		console.log(req.session);
		res.render('dashboard', {
			user: req.session.user
		});
	}
});

app.use(express.static(path.resolve(__dirname, 'client')));

module.exports = app;
