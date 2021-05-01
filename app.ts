const express = require('express');
const morgan = require('morgan');
const webSocket = require('ws');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt-nodejs');
const f = require('./server/f');

const router = require('./routes/routes');
const wss = new webSocket.Server({ port: 7565 });

const app = express();

function take(arr, item) {
	arr.splice(arr.indexOf(item), 1);
	return arr;
};

function isArr(obj) {
	return Object.prototype.toString.call(obj) === '[object Array]'
}

app.use(express.static('public'));
app.set('view engine', 'ejs');

const port = process.env.PORT || 8792;

app.use(morgan('dev'));

const sockets = [];
wss.on('connection', (ws) => {
	sockets.push(ws);
	
	ws.on('message', (message) => {
		console.log(message)
		sockets.forEach(s => {s.send(message)})
	});

	ws.on('close', () => {
		take(sockets, ws);
	});

});

app.use('/', router);

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
