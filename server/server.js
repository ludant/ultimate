'use strict';
var express = require('express');
var morgan = require('morgan');
var app = express();
app.use(express.static('public'));
app.set('view engine', 'ejs');
var port = process.env.PORT || 8791;
app.use(morgan('dev'));
app.get('/', function (req, res) {
    res.render('index', { username: null });
});
app.get('/signin', function (req, res) {
    res.render('signin');
});
app.get('/register', function (req, res) {
    res.render('register');
});
// 404
app.use(function (req, res) {
    res.status(404);
    res.render('404');
});
// 500
app.use(function (err, req, res, next) {
    console.error(err.message);
    res.status(500);
    res.render('500');
});
app.listen(port, function () { return console.log('aww yis on port ' + port); });
