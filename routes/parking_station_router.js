'use strict';
var express = require('express');
var router = express.Router();

// load controllers
const account_controller = require('../controller/account_controller');
const login_controller = require('../controller/login_controller');
const parking_station_controller = require('../controller/parking_station_controller');

router.get('/', function(req, res, next) {res.redirect('parking_station/home');});

// home page
router.get('/home', function (req, res) { res.render('user/home'); });
// account page
router.get('/account', function(req, res) {res.render('parking_station/account');});
// info page
router.get('/info', function(req, res) {res.render('parking_station/info');});

//!router.get('/my_parking', function(req, res) {res.render('parking_station/my_parking');});
// load sign pages
router.get('/sign_in', function(req, res) {res.render('parking_station/sign_in');});
router.get('/sign_up', function(req, res) {res.render('parking_station/sign_up');});
router.get('/logout', login_controller.logout_parking_station);
// submit sign pages
router.post('/sign_in', login_controller.login_parking_station);
router.post('/sign_up', login_controller.add_new_parking_station);

module.exports = router;