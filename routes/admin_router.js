'use strict';
var express = require('express');
var router = express.Router();

// load controllers
const account_controller = require('../controller/account_controller');
const login_controller = require('../controller/login_controller');
const admin_controller = require('../controller/admin_controller');

router.get('/', function(req, res, next) {res.redirect('/admin/home');}); // res.send('admin router maintance');

// home page
router.get('/home', admin_controller.get_admin_home_page);

module.exports = router;