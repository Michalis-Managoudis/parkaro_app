var express = require('express');
var router = express.Router();
var dataModel = require('../models/data-model.js');

/* GET home page. */

// router.get('/', function(req, res, next) {res.render('index');});

router.get('/', function (req, res) { res.render('user/home'); });

router.get('/account', function (req, res) { res.render('user/account'); });

router.get('/airport', function (req, res) { res.render('user/airport'); });

router.get('/city', function (req, res) { dataModel.readTable("user", function (data) {res.render('user/city', {nameu: data["1"].email});})  });
// router.get('/city', function (req, res) { res.render('user/city', { nameu: dataModel.readTable("user") }); });
dataModel.readTable("user", function (dataa) {console.log(dataa);})

router.get('/home', function (req, res) { res.render('user/home'); });

router.get('/info', function (req, res) { res.render('user/info'); });

router.get('/port', function (req, res) { res.render('user/port'); });

router.get('/sign_in', function (req, res) { res.render('user/sign_in'); });

router.get('/sign_up', function (req, res) { res.render('user/sign_up'); });

router.post('/sign_in', function (req, res) { res.render('user/sign_in'); });

router.post('/sign_up', function (req, res) { res.render('user/sign_up'); });

module.exports = router;
