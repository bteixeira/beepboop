var path = require('path');

var express = require('express');
var session = require('express-session');
var bodyParser = require('body-parser');

var app = express();

var storage = require('../storage/default');
var connection;
storage.getConnection(null, (err, db) => {
	if (err) {
		throw err;
	}
	connection = db;
});

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

	if (!name) {
		res.status(400).end();
		return;
	}

	var user = connection.findUserByName(name, (err, user) => {
		if (err) {
			console.error(err);
			res.status(500).send(err);
			return;
		}
		if (!user) {
			console.log('creating new user', name);
			connection.insertUser({name: name, credits: 1}, (err) => {
				if (err) {
					console.error(err);
					res.status(500).send(err);
					return;
				}
				req.session.name = name;
				res.redirect('/dashboard');
			});
		} else {
			console.log('fetched user', user);
			req.session.name = name;
			res.redirect('/dashboard');
		}
	});

});

app.get('/logout', function (req, res) {
	if (req.session.name) {
		req.session.destroy(() => {
			res.redirect('/');
		});
	} else {
		res.redirect('/');
	}
});

app.get('/dashboard', function (req, res) {
	if (!req.session.name) {
		res.redirect('/');
	} else {
		console.log(req.session);
		connection.findUserByName(req.session.name, (err, user) => {
			if (err) {
				console.error(err);
				res.status(500).send(err);
				return;
			}
			res.render('dashboard', {
				user: user
			});
		});
	}
});

app.use(express.static(path.resolve(__dirname, 'client')));

module.exports = app;
