var express = require('express');
var router = express.Router();


router.get('/', function(req, res, next) {
  res.send('admin router maintance');
});

module.exports = router;