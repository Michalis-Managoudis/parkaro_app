'use strict';
const express = require('express');
const router = express.Router();

// load controllers
const account_controller = require('../controller/account_controller');
const login_controller = require('../controller/login_controller');
const user_controller = require('../controller/user_controller');

//!!!!!!!!
// const dataModel = require('../models/sqlite_data_model.js');
// const db = require('../database/db');

router.get('/', function (req, res) { res.redirect('/home'); });
// home page
router.get('/home', function (req, res) { res.render('user/home'); });
// console.log(req.protocol); console.log(req.route); console.log(req.secure);
// parking pages
router.get('/city', function (req, res) { res.render('user/city', { nameu: "opa" }); });
router.get('/airport', function (req, res) { res.render('user/airport'); });
router.get('/port', function (req, res) { res.render('user/port'); });
// account page
router.get('/account', function (req, res) { res.render('user/account'); });
// info page
router.get('/info', function (req, res) { res.render('user/info'); });
// load sign pages
router.get('/sign_in', function (req, res) { res.render('user/sign_in'); });
router.get('/sign_up', function (req, res) { res.render('user/sign_up'); });
router.get('/logout', login_controller.logout_user);
// submit sign pages
router.post('/sign_in', login_controller.login_user);
router.post('/sign_up', login_controller.add_new_user);

module.exports = router;







// router.get('/', function (req, res) { res.redirect('/home'); });
// router.get('/account', function (req, res) { res.render('user/account'); });
// router.get('/airport', function (req, res) { res.render('user/airport'); });
// router.get('/city', function (req, res) { dataModel.readTable("user", function (data) {res.render('user/city', {nameu: data["1"].email});})  });
// router.get('/city', function (req, res) { res.render('user/city', { nameu: dataModel.readTable("user") }); });
// dataModel.readData("user", "email", "" , function (dataa) {console.log(dataa);})
// router.get('/home', function (req, res) { res.render('user/home'); });
// router.get('/info', function (req, res) { res.render('user/info'); });
// router.get('/port', function (req, res) { res.render('user/port'); });
// router.get('/sign_in', function (req, res) { res.render('user/sign_in'); });
// router.get('/sign_up', function (req, res) { res.render('user/sign_up'); });
// router.post('/sign_in', function (req, res) { res.render('user/sign_in'); });
// router.post('/sign_up', function (req, res) { res.render('user/sign_up'); });