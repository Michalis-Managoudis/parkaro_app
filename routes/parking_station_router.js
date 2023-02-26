'use strict';
var express = require('express');
var router = express.Router();

const multer = require('multer');
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, './user_images');
  },
  filename: function (req, file, cb) {
    cb(null, "p" + req.session.sid + ".jpeg");
  }
});
const upload = multer({
  storage: storage,
  limits: { fileSize: 10000000 },
  fileFilter(req, file, cb) {
    if (!file.originalname.match(/\.(jpg|jpeg)$/)) return cb(new Error('Please upload a valid image file'));
    cb(undefined, true);
  }
});

// load controllers
const account_controller = require('../controller/account_controller');
const login_controller = require('../controller/login_controller');
const parking_station_controller = require('../controller/parking_station_controller');

router.get('/', function(req, res) {res.redirect('/parking_station/home');});                                                   //? ready
router.get('/rd_notif', parking_station_controller.read_parking_station_notifications);                                         //? ready
// home page
router.get('/home', parking_station_controller.get_parking_station_home_page);                                                  //? ready
router.post('/home', parking_station_controller.search_parking_station_reservation_availability);                               //? ready
router.post('/add_reservation', parking_station_controller.add_parking_station_reservation);                                    //? ready
router.get('/my_parking',parking_station_controller.get_parking_station_my_parking_page);                                       //? ready
router.post('/delete_reservation', parking_station_controller.delete_parking_station_reservation);                              //? ready
router.post('/update_reservation', parking_station_controller.update_parking_station_reservation);                              //? ready
router.post('/change_reservation_state', parking_station_controller.change_reservation_state);                                  //? ready
// change language page
router.get('/language', account_controller.change_language);                                                                    //? ready
// account page
router.get('/account', account_controller.get_parking_station_account_page);                                                    //? ready
router.post('/account', account_controller.update_parking_station_data);                                                        //? ready
router.post('/account_pass', account_controller.update_parking_station_password);                                               //? ready
router.post('/account/delete', account_controller.delete_parking_station_account); // delete account                            //? ready
// upload image
router.post('/upload_image', upload.single('image_file'), function (req, res) { res.redirect('/parking_station/account'); });   //? ready
router.get('/delete_image', parking_station_controller.delete_parking_station_image); // delete account                         //? ready
// info page
router.get('/info', parking_station_controller.get_parking_station_info_page);                                                  //? ready
// load sign pages
router.get('/sign_in', login_controller.get_parking_station_sign_in_page);                                                      //? ready
router.get('/sign_up', login_controller.get_parking_station_sign_up_page);                                                      //? ready
router.get('/logout', login_controller.logout_parking_station);                                                                 //? ready                    
// submit sign pages
router.post('/sign_in', login_controller.login_parking_station);                                                                //? ready
router.post('/sign_up', login_controller.add_new_parking_station);                                                              //? ready                
// local
//? router.get('/local_post_data', parking_station_controller.get_local_parking_station_data);                                      //? ready
router.post('/local_post_data', parking_station_controller.post_local_parking_station_data);                                    //? ready

module.exports = router;