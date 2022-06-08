var sqlite3 = require('sqlite3').verbose();
var db = new sqlite3.Database('./database/db.sqlite');
// db.close();
module.exports = db;