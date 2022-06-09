var express = require('express');
var router = express.Router();


router.get('/', function(req, res, next) {res.render('admin/home');}); // res.send('admin router maintance');

module.exports = router;