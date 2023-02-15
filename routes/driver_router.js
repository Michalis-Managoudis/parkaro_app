'use strict';
const express = require('express');
const router = express.Router();

// load controllers
const account_controller = require('../controller/account_controller');
const login_controller = require('../controller/login_controller');
const driver_controller = require('../controller/driver_controller');

// const dataModel = require('../models/sqlite_data_model.js');
// const db = require('../database/db');

router.get('/', function (req, res) { res.redirect('/home'); });                                //? ready
// home page
router.get('/home', driver_controller.get_driver_home_page);                                    //? ready
router.post('/home', driver_controller.search_driver_home_page);                                //? ready
router.get('/rd_notif', driver_controller.read_driver_notifications);                           //? ready
// console.log(req.protocol); console.log(req.route); console.log(req.secure);
// parking pages
router.get('/city', driver_controller.get_driver_city_page);                                    //? ready

router.get('/airport', driver_controller.get_driver_airport_page);                              //? ready
router.post('/airport', driver_controller.search_driver_airport_page);                          //? ready

router.get('/port', driver_controller.get_driver_port_page);                                    //? ready
router.post('/port', driver_controller.search_driver_port_page);                                //? ready

router.get('/book/:ps_id', driver_controller.get_driver_book_page);                             //? ready
router.post('/book', driver_controller.search_driver_reservation_availability);                 //? ready
router.post('/book/add', driver_controller.add_driver_reservation);                             //? ready
router.post('/delete_reservation', driver_controller.delete_driver_reservation);                //? ready
router.post('/delete_car', driver_controller.delete_driver_car);                                //? ready
router.post('/update_car', driver_controller.update_driver_car);                                //? ready
//! router.post('/update_reservation', driver_controller.update_driver_reservation);
router.post('/add_review', driver_controller.add_driver_review);                                //? ready
router.post('/delete_review', driver_controller.delete_driver_review);                          //? ready
//! router.post('/history', driver_controller.search_driver_reservation_availability);
// change language page
router.get('/language', account_controller.change_language);                                    //? ready
// account page
router.get('/account', account_controller.get_driver_account_page);                             //? ready
router.post('/account', account_controller.update_driver_data); // update account               //? ready
router.post('/account_pass', account_controller.update_driver_password); // update account      //? ready
router.post('/account/delete', account_controller.delete_driver_account); // delete account     //? ready

router.get('/history', driver_controller.get_driver_history_page);                              //? ready
router.post('/account/add_new_car', driver_controller.add_new_driver_car);                      //? ready
// info page
router.get('/info', driver_controller.get_driver_info_page);                                    //? ready
// load sign pages
router.get('/sign_in', login_controller.get_driver_sign_in_page);                               //? ready
router.get('/sign_up', login_controller.get_driver_sign_up_page);                               //? ready
router.get('/logout', login_controller.logout_driver);                                          //? ready
// submit sign pages
router.post('/sign_in', login_controller.login_driver);                                         //? ready
router.post('/sign_up', login_controller.add_new_driver);                                       //? ready

module.exports = router;