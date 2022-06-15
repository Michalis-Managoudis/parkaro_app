'use strict';
const db = require('../database/db');

const schema = {
  "user": ["id", "email", "password", "name", "phone", "photo", "points"],
  "car": ["id", "user_id", "plate", "model", "color", "photo"],
  "parking_station": ["id", "email", "password", "tin", "company_name", "tax_office", "address", "phone", "lots", "location", "name", "photo", "work_hours", "price_list", "discount", "info", "s_height", "s_length", "s_covered", "s_keys", "s_card", "s_charger", "s_english", "s_camera", "s_wash"],
  "parking_lot": ["id", "parking_station_id"],
  "reservation": ["id", "car_id", "parking_lot_id", "dstart", "end", "price"],
  "review": ["id", "parking_station_id", "stars", "description"]
};

const schema_required = {
  "user": ["email", "password", "name", "phone"],
  "car": ["user_id", "plate", "model", "color"],
  "parking_station": ["email", "password", "tin", "company_name", "tax_office", "address", "phone", "lots", "location", "name", "photo", "work_hours", "price_list", "info", "s_height", "s_length", "s_covered", "s_keys", "s_card", "s_charger", "s_english", "s_camera", "s_wash"],
  "parking_lot": ["parking_station_id"],
  "reservation": ["car_id", "parking_lot_id", "dstart", "end", "price"],
  "review": ["parking_station_id", "stars", "description"]
};

const schema_parking_station_boolean = ["s_covered", "s_keys", "s_card", "s_charger", "s_english", "s_camera", "s_wash"];
// function readTable(table) {
//     const sql = `SELECT * FROM ${table}`;
//     let data = [];
//     db.each(sql,function(err, row) {data.push(row);  console.log(data);});
//     return data;
// };

function read_(table, fld, cond, cb) {
  // const sql = `SELECT id, ${fld} FROM ${table} ${cond}`;
  let sql = `SELECT `;
  if (fld) { sql += `id, ${fld} `; }
  else { sql += `* `; }
  sql += `FROM ${table}`;
  if (cond) { sql += ` WHERE ${cond}`; }

  db.all(sql, function (err, rows) {
    if (err) throw (err);
    if (cb) cb(rows);
  })
};

// function read_(table, fld, cond) {
//   // const sql = `SELECT id, ${fld} FROM ${table} ${cond}`;
//   let sql = `SELECT `;
//   if (fld) { sql += `id, ${fld} `; }
//   else { sql += `* `; }
//   sql += `FROM ${table}`;
//   if (cond) { sql += ` WHERE ${cond}`; }

//   const promise = new Promise(function (resolve, reject) {
//     const data = db.all(sql, function (err, rows) { resolve(rows); });
//   })
//   promise.then(function (dt) { return dt; })
// };

function create_(table, vls, cb) {
  const fields = schema_required[table].join(", ");
  const values = "'" + vls.join("', '") + "'";
  const sql = `INSERT INTO ${table} (${fields}) VALUES (${values})`;
  db.run(sql, cb);
};

function update_(table, row, cb) {
  let pairs = "";
  let field = "";
  for (field of schema[table].slice(1)) {   /* for every column except id */
    if (pairs) pairs += ", ";    /* insert comma unless string is empty */
    pairs += `${field} = '${row[field]}'`;   /* column = 'value' */
  }
  const sql = `UPDATE ${table} SET ${pairs} WHERE id = ${row.id}`;
  db.run(sql, cb);
};

function delete_(table, id, cb) {
  const sql = `DELETE FROM ${table} WHERE id = ${id};`;
  db.run(sql, cb);
};

// function check_if_exists_(table, fld, val, cb) {
//   const cond = `${fld} = "${val}"`;
//   const sql = `SELECT id FROM ${table} WHERE ${cond}`;
//   db.all(sql, function (data) {
//     if (Object.keys(data).length === 0) {
//       console.log("not");
//       return false;
//     }
//     else {
//       console.log("yes");
//       return true;
//     }
//   })
// };

function auth_(table, email, pass, cb) {
  const sql = `SELECT id, email, password FROM ${table} WHERE email = "${email}" AND password = "${pass}"`;
  db.get(sql, function (err, row) {
    if (err) throw (err);
    if (cb) cb(row);
  })
};

// - ?????????????????????????????????????
function get_parking_evaluation(id, cb) {
  const sql = `SELECT avg(stars) FROM review WHERE parking_id = ${id};`;
};

function find_parking_space(id, cb) { 

};

module.exports = {
  schema,
  schema_required,
  schema_parking_station_boolean,
  read_,
  create_,
  update_,
  delete_,
  auth_
  // check_if_exists_
}