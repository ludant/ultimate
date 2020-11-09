'use strict';

const express = require('express');
const morgan = require('morgan');
const webSocket = require('ws');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const f = require('./server/f');

const router = require('./routes/routes');
const wss = new webSocket.Server({ port: 7565 });

const app = express();

app.use(express.static('public'));
app.set('view engine', 'ejs');

const port = process.env.PORT || 8791;

app.use(morgan('dev'));

const sockets = {};
wss.on('connection', (ws) => {
	sockets.push(ws);
	
	ws.on('message', (message) => {
		console.log(`recieved ${message}`);
		sockets.forEach(s => s.send(message));
	});

	ws.on('close', () => {
		f.take(sockets, ws);
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
