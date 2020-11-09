"use strict";
var express = require('express');
var router = express.Router();
router.get('/', function (req, res) {
    res.render('index', { username: null });
});
router.get('/signin', function (req, res) {
    res.render('signin');
});
router.get('/register', function (req, res) {
    res.render('register');
});
module.exports = router;
