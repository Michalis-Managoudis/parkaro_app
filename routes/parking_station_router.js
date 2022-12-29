'use strict';
var express = require('express');
var router = express.Router();

// load controllers
const account_controller = require('../controller/account_controller');
const login_controller = require('../controller/login_controller');
const parking_station_controller = require('../controller/parking_station_controller');




router.get('/', function(req, res) {res.redirect('/parking_station/home');});
//router.get('/history', function(req, res) {res.redirect('/parking_station/home');});
// home page
router.get('/home', parking_station_controller.get_parking_station_home_page);
router.post('/home', parking_station_controller.search_parking_station_reservation_availability);
router.post('/add_reservation', parking_station_controller.add_parking_station_reservation);
router.get('/my_parking',parking_station_controller.get_parking_station_my_parking_page);
router.post('/delete_reservation', parking_station_controller.delete_parking_station_reservation);
router.post('/update_reservation', parking_station_controller.update_parking_station_reservation);
// change language page
router.get('/language', account_controller.change_language);                                            //? !!!!!!! ready
// account page
router.get('/account', account_controller.get_parking_station_account_page);                            //? !!!!!!! ready
router.post('/account', account_controller.update_parking_station_data);                                //? !!!!!!! ready
router.get('/account/delete', account_controller.delete_parking_station_account); // delete account     //? !!!!!!! ready
// info page
router.get('/info', parking_station_controller.get_parking_station_info_page);                          //? !!!!!!! ready
// load sign pages
router.get('/sign_in', login_controller.get_parking_station_sign_in_page);                              //? !!!!!!! ready
router.get('/sign_up', login_controller.get_parking_station_sign_up_page);                              //? !!!!!!! ready
router.get('/logout', login_controller.logout_parking_station);                                         //? !!!!!!! ready
// submit sign pages
router.post('/sign_in', login_controller.login_parking_station);                                        //? !!!!!!! ready
router.post('/sign_up', login_controller.add_new_parking_station);                                      //? !!!!!!! ready

module.exports = router;