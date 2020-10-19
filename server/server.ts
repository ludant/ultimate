'use strict';

const express = require('express');
const morgan = require('morgan');

const app = express();

app.use(express.static('public'));
app.set('view engine', 'ejs');

const port = process.env.PORT || 8791;

app.use(morgan('dev'));

app.get('/', (req, res) => {
	res.render('index', { username: null } );
});

app.get('/signin', (req, res) => {
	res.render('signin');
});

app.get('/register', (req, res) => {
	res.render('register');
});

// 404
app.use((req, res) => {
	res.status(404);
	res.render('404');
});

// 500
app.use((err, req, res, next) => {
	console.error(err.message)
	res.status(500);
	res.render('500');
});

app.listen(port, () => console.log('aww yis on port ' + port));
