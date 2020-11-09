"use strict";

const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
	res.render('index', { username: null } );
});

router.get('/signin', (req, res) => {
	res.render('signin');
});

router.get('/register', (req, res) => {
	res.render('register');
});

module.exports = router;
