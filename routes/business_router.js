var express = require('express');
var router = express.Router();

router.get('/', function(req, res, next) {res.render('business/home');}); // res.send('business router maintance');

router.get('/account', function(req, res) {res.render('business/account');});

router.get('/info', function(req, res) {res.render('business/info');});

router.get('/my_parking', function(req, res) {res.render('business/my_parking');});

router.get('/sign_in', function(req, res) {res.render('business/sign_in');});

router.get('/sign_up', function(req, res) {res.render('business/sign_up');});

router.post('/sign_in', function(req, res) {res.render('business/sign_in');});

router.post('/sign_up', function(req, res) {res.render('business/sign_up');});

module.exports = router;