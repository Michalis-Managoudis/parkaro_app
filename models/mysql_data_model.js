'use strict';

const mysql = require('mysql');
const conn = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "$AmazonaB933776",
  database: "parkaro_app_db",
});

conn.connect(function (err) {
  if (err) throw err;
  console.log("Connected!MySQL");
});

const schema = {
  "user": ["id", "email", "password", "name", "phone", "lang", "photo", "points"],
  "car": ["id", "user_id", "plate", "model", "color", "photo"],
  "parking_station": ["id", "email", "password", "tin", "company_name", "tax_office", "address", "phone", "lots", "location", "name", "type", "lang", "photo", "work_hours", "price_list", "discount", "info", "s_height", "s_length", "s_covered", "s_keys", "s_card", "s_charger", "s_english", "s_camera", "s_wash"],
  "parking_lot": ["id", "parking_station_id"],
  "reservation": ["id", "car_id", "parking_lot_id", "dstart", "end", "price"],
  "review": ["id", "parking_station_id", "stars", "description"]
};
const schema_required = {
  "user": ["email", "password", "name", "phone"],
  "car": ["user_id", "plate", "model", "color"],
  "parking_station": ["email", "password", "tin", "company_name", "tax_office", "address", "phone", "lots", "location", "name", "type", "photo", "work_hours", "price_list", "info", "s_height", "s_length", "s_covered", "s_keys", "s_card", "s_charger", "s_english", "s_camera", "s_wash"],
  "parking_lot": ["parking_station_id"],
  "reservation": ["car_id", "parking_lot_id", "dstart", "end", "price"],
  "review": ["parking_station_id", "stars", "description"]
};
const schema_show = { //? , "lang";;;;;;;
  "user": ["email", "name", "phone", "photo", "points"],
  "car": ["plate", "model", "color", "photo"],
  "parking_station": ["email", "tin", "company_name", "tax_office", "address", "phone", "lots", "location", "name", "type", "photo", "work_hours", "price_list", "discount", "info", "s_height", "s_length", "s_covered", "s_keys", "s_card", "s_charger", "s_english", "s_camera", "s_wash"],
  "parking_lot": ["parking_station_id"],
  "reservation": ["car_id", "parking_lot_id", "dstart", "end", "price"],
  "review": ["parking_station_id", "stars", "description"]
};
const schema_editable = {
  "user": ["email", "password", "name", "phone", "lang", "photo"],
  "car": ["plate", "model", "color", "photo"],
  "parking_station": ["email", "password", "tin", "company_name", "tax_office", "address", "phone", "lots", "location", "name", "type", "lang", "photo", "work_hours", "price_list", "discount", "info", "s_height", "s_length", "s_covered", "s_keys", "s_card", "s_charger", "s_english", "s_camera", "s_wash"],
  "reservation": ["car_id", "dstart", "end"],
  "review": ["stars", "description"]
};
const schema_unique = {
  "user": ["email", "phone"],
  "parking_station": ["email", "tin"]
};
const schema_parking_station_boolean = ["s_covered", "s_keys", "s_card", "s_charger", "s_english", "s_camera", "s_wash"];

function read_(table, fld, cond, cb) {
  // const sql = `SELECT id, ${fld} FROM ${table} ${cond}`;
  let sql = `SELECT `;
  if (fld) { sql += `id, ${fld} `; }
  else { sql += `* `; }
  sql += `FROM ${table}`;
  if (cond) { sql += ` WHERE ${cond}`; }
  conn.query(sql, function (err, data) {
    if (err) throw (err);
    if (cb) cb(data);
  });
};

function create_(table, vls, cb) {
  const fields = schema_required[table].join(", ");
  //!let values = mysql.escape(vls);
  //console.log(sql);
  let values = "'" + vls.join("', '") + "'";
  // console.log(values);
  let sql = `INSERT INTO ${table} (${fields}) VALUES (${values})`;
  // console.log(sql);
  // values = mysql.escape(values);
  // sql = `INSERT INTO ${table} (${fields}) VALUES (${values})`;
  // console.log(sql);
  conn.query(sql, function (err, data) {
    if (err) throw (err);
    if (cb) cb(data);
  });
};

function update_(table, row, cb) {
  let pairs = "";
  let field = "";
  for (field of schema_editable[table]) {   /* for every column except id */
    if (pairs) pairs += ", ";    /* insert comma unless string is empty */
    pairs += `${field} = '${row[field]}'`;   /* column = 'value' */
  }
  const sql = `UPDATE ${table} SET ${pairs} WHERE id = ${row.id}`;
  conn.query(sql, function (err, data) {
    if (err) throw (err);
    if (cb) cb(data);
  });
};

function delete_(table, id, cb) {
  const sql = `DELETE FROM ${table} WHERE id = ${id};`;
  conn.query(sql, function (err, data) {
    if (err) throw (err);
    if (cb) cb(data);
  });
};

function auth_(table, email, pass, cb) {
  const sql = `SELECT id, lang FROM ${table} WHERE email = "${email}" AND password = "${pass}"`;
  conn.query(sql, function (err, data) {
    if (err) throw (err);
    if (cb) cb(JSON.parse(JSON.stringify(data))[0]); //! if is only one
  });
};

function get_(table, id, cb) {
  const fields = schema_show[table].join(", ");
  const sql = `SELECT ${fields} FROM ${table} WHERE id = "${id}"`;
  conn.query(sql, function (err, data) {
    if (err) throw (err);
    if (cb) cb(JSON.parse(JSON.stringify(data))[0]);
  });
};

function check_(table, id, fld, vl, cb) {
  const sql = `SELECT id FROM ${table} WHERE ${fld} = "${vl}" AND id != ${id}`;
  conn.query(sql, function (err, data) {
    if (err) throw (err);
    if (JSON.parse(JSON.stringify(data)).length) cb(false);
    else cb(true);
  });
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
  schema_show,
  schema_editable,
  schema_parking_station_boolean,
  read_,
  create_,
  update_,
  delete_,
  auth_,
  get_,
  check_
}