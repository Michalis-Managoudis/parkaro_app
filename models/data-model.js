var db = require('../database/db');

/*  var schema is used for convenience to get column names in updateRow() */

var schema = {
    "User": [
        "user_id", "mail", "password", "name"],
    "parking": [
        "id", "location"],
    "reservation": [
        "id", "user_id", "parking_id", "date", "duration"]
};

// function readTable (table, cb) {
//     let sql = `SELECT * FROM ${table}`;
//     let data = {};
//     db.all(sql, function(err, rows) {        /* Return all results of query */
//       if (err) throw(err);            /* If there's an error, terminate app */
//       rows.forEach(function(row) {       /* For each row matching the query */
//         data[row.id] = {};                  /* init row id as top-level key */
//         Object.keys(row).forEach(function(k) {    /* For each column of row */
//           data[row.id][k] = unescape(row[k]);     /* add the key-value pair */
//         });
//       });
//       cb(data);    /* data = { id: { "colname" : value }, ... }, id2: ... } */
//     });
//   };

function readTable (table, cb) {
    let sql = `SELECT * FROM ${table}`;
    let data = {};
    db.all(sql, function(err, rows) {        /* Return all results of query */
      if (err) throw(err);            /* If there's an error, terminate app */
      rows.forEach(function(row) {       /* For each row matching the query */
        data[row.id] = {};                  /* init row id as top-level key */
        Object.keys(row).forEach(function(k) {    /* For each column of row */
          data[row.id][k] = unescape(row[k]);     /* add the key-value pair */
        });
      });
      cb(data);    /* data = { id: { "colname" : value }, ... }, id2: ... } */
    });
    // console.log(data);
  };

// function readTable(table) {
//     let sql = `SELECT * FROM ${table}`;
//     let data = [];
//     db.each(sql,function(err, row) {data.push(row);  console.log(data);});
//     return data;
// };

// module.exports = {
//     schema,
//     readTable
// }

module.exports = {readTable}