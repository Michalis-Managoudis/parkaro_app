var express = require('express');
var router = express.Router();

router.get('/', function(req, res, next) {
  res.send('business router maintance');
});

module.exports = router;