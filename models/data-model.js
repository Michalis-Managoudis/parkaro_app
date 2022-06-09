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

// function readTable(table) {
//     let sql = `SELECT * FROM ${table}`;
//     let data = [];
//     db.each(sql,function(err, row) {data.push(row);  console.log(data);});
//     return data;
// };
function readTable(table, cb) {
  let sql = `SELECT * FROM ${table}`;
  let data = {};
  db.all(sql, function (err, rows) {        /* Return all results of query */
    if (err) throw (err);            /* If there's an error, terminate app */
    rows.forEach(function (row) {       /* For each row matching the query */
      data[row.id] = {};                  /* init row id as top-level key */
      Object.keys(row).forEach(function (k) {    /* For each column of row */
        data[row.id][k] = unescape(row[k]);     /* add the key-value pair */
      });
    });
    cb(data);    /* data = { id: { "colname" : value }, ... }, id2: ... } */
  });
  // console.log(data);
};

function readRow(table, cond, cb) {
  let sql = `SELECT * FROM ${table} WHERE ${cond}`;
  let data = {};
  db.all(sql, function (err, rows) {
    if (err) throw (err);
    rows.forEach(function (row) {
      data[row.id] = {};
      Object.keys(row).forEach(function (k) {
        data[row.id][k] = unescape(row[k]);
      });
    });
    cb(data);
  })
};

// function readField(table, fd, cb) {
//   let sql = `SELECT ${fd} FROM ${table}`;
// };

function readData(table, fld, cond, cb) {
  let sql = `SELECT id, ${fld} FROM ${table} ${cond}`;
  let data = {};
  db.all(sql, function (err, rows) {
    if (err) throw (err);
    rows.forEach(function (row) {
      data[row.id] = {};
      Object.keys(row).forEach(function (k) {
        data[row.id][k] = unescape(row[k]);
      });
    });
    cb(data);
  })
};

function createRow(table, cb) {
  let sql = `INSERT INTO ${table} DEFAULT VALUES`;
  db.run(sql, cb);
};

function updateRow(table, rb, cb) {
  var pairs = "";           /* for constructing 'identifier = value, ...' */
  for (field of schema[table].slice(1)) {   /* for every column except id */
    if (pairs) pairs += ", ";    /* insert comma unless string is empty */
    pairs += `${field} = '${escape(rb[field])}'`;   /* column = 'value' */
  }
  let sql = `UPDATE ${table} SET ${pairs} WHERE id = ?`;  /* ? = rb['id'] */
  db.run(sql, rb['id'], cb);
};

function deleteRow(table, id, cb) {
  let sql = `DELETE FROM ${table} WHERE id = ${id};`;
  db.run(sql, cb);
};

module.exports = {
  schema,
  readTable,
  readData,
  createRow,
  updateRow,
  deleteRow
}