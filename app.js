'use strict';
var express = require('express');
var morgan = require('morgan');
var webSocket = require('ws');
var cookieParser = require('cookie-parser');
var session = require('express-session');
var mongoose = require('mongoose');
var bcrypt = require('bcrypt-nodejs');
var f = require('./server/f');
var router = require('./routes/routes');
var wss = new webSocket.Server({ port: 7565 });
var app = express();
app.use(express.static('public'));
app.set('view engine', 'ejs');
//const SALT_FACTOR = 10;
//const userSchema = mongoose.Schema({
//	username: { type: String, required: true, unique: true },
//	password: { type: String, required: true },
//	email: { type: Date, default: Date.now },
//	bio: String
//});
//function noop() {}
//userSchema.pre('save', function(done) {
//	const user = this;
//	if (!user.isModified('password')) {
//		return done();
//	}
//	function storePassword(err, hashedPassword) {
//		if (err) { return done(err); }
//		user.password = hashedPassword;
//		done();
//	}
//	bcrypt.genSalt(SALT_FACTOR, function(err, salt) {
//		if (err) { return done(err); }
//		bcrypt.hash(user.password, salt, noop, storePassword)
//	});
//});
var port = process.env.PORT || 8792;
app.use(morgan('dev'));
var sockets = [];
wss.on('connection', function (ws) {
    sockets.push(ws);
    ws.on('message', function (message) {
        console.log(message);
        sockets.forEach(function (s) { s.send(message); });
    });
    ws.on('close', function () {
        f.take(sockets, ws);
    });
});
app.use('/', router);
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
