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
router.get('/home', user_controller.get_user_home_page);
// console.log(req.protocol); console.log(req.route); console.log(req.secure);
// parking pages
router.get('/city', user_controller.get_user_city_page);
router.get('/airport', user_controller.get_user_airport_page);
router.get('/port', user_controller.get_user_port_page);
router.get('/book', user_controller.get_user_book_page);
// change language page
router.get('/language', account_controller.change_language);
// account page
router.get('/account', account_controller.get_user_account_page);                           //? !!!!!!! ready
router.post('/account', account_controller.update_user_data); // update account             //? !!!!!!! ready
router.get('/account/delete', account_controller.delete_user_account); // delete account    //? !!!!!!! ready
// info page
router.get('/info', user_controller.get_user_info_page);                                    //? !!!!!!! ready
// load sign pages
router.get('/sign_in', login_controller.get_user_sign_in_page);                             //? !!!!!!! ready
router.get('/sign_up', login_controller.get_user_sign_up_page);                             //? !!!!!!! ready
router.get('/logout', login_controller.logout_user);                                        //? !!!!!!! ready
// submit sign pages
router.post('/sign_in', login_controller.login_user);                                       //? !!!!!!! ready
router.post('/sign_up', login_controller.add_new_user);                                     //? !!!!!!! ready

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