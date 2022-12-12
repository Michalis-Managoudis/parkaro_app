'use strict';
const express = require('express');
const router = express.Router();

// load controllers
const account_controller = require('../controller/account_controller');
const login_controller = require('../controller/login_controller');
const driver_controller = require('../controller/driver_controller');

//!!!!!!!!
// const dataModel = require('../models/sqlite_data_model.js');
// const db = require('../database/db');

router.get('/', function (req, res) { res.redirect('/home'); });
// home page
router.get('/home', driver_controller.get_driver_home_page);
router.post('/home', driver_controller.search_driver_home_page);
// console.log(req.protocol); console.log(req.route); console.log(req.secure);
// parking pages
router.get('/city', driver_controller.get_driver_city_page);
router.get('/airport', driver_controller.get_driver_airport_page);
router.get('/port', driver_controller.get_driver_port_page);
router.get('/book/:ps_id', driver_controller.get_driver_book_page);
router.post('/book/:ps_id', driver_controller.add_driver_reservation);
router.post('/review/:res_id/:ps_id', driver_controller.add_driver_review);
// change language page
router.get('/language', account_controller.change_language);                                //? !!!!!!! ready
// account page
router.get('/account', account_controller.get_driver_account_page);                           //? !!!!!!! ready
router.post('/account', account_controller.update_driver_data); // update account             //? !!!!!!! ready
router.get('/account/delete', account_controller.delete_driver_account); // delete account    //? !!!!!!! ready
router.get('/history', account_controller.get_driver_history_page);
router.post('/account/add_new_car', account_controller.add_new_driver_car); 
// info page
router.get('/info', driver_controller.get_driver_info_page);                                    //? !!!!!!! ready
// load sign pages
router.get('/sign_in', login_controller.get_driver_sign_in_page);                             //? !!!!!!! ready
router.get('/sign_up', login_controller.get_driver_sign_up_page);                             //? !!!!!!! ready
router.get('/logout', login_controller.logout_driver);                                        //? !!!!!!! ready
// submit sign pages
router.post('/sign_in', login_controller.login_driver);                                       //? !!!!!!! ready
router.post('/sign_up', login_controller.add_new_driver);                                     //? !!!!!!! ready

module.exports = router;

// router.get('/', function (req, res) { res.redirect('/home'); });
// router.get('/account', function (req, res) { res.render('driver/account'); });
// router.get('/airport', function (req, res) { res.render('driver/airport'); });
// router.get('/city', function (req, res) { dataModel.readTable("driver", function (data) {res.render('driver/city', {nameu: data["1"].email});})  });
// router.get('/city', function (req, res) { res.render('driver/city', { nameu: dataModel.readTable("driver") }); });
// dataModel.readData("driver", "email", "" , function (dataa) {console.log(dataa);})
// router.get('/home', function (req, res) { res.render('driver/home'); });
// router.get('/info', function (req, res) { res.render('driver/info'); });
// router.get('/port', function (req, res) { res.render('driver/port'); });
// router.get('/sign_in', function (req, res) { res.render('driver/sign_in'); });
// router.get('/sign_up', function (req, res) { res.render('driver/sign_up'); });
// router.post('/sign_in', function (req, res) { res.render('driver/sign_in'); });
// router.post('/sign_up', function (req, res) { res.render('driver/sign_up'); });