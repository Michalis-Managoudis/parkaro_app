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
  "driver": ["id", "email", "password", "name", "phone", "lang", "parking_station_id", "points"],
  "car": ["id", "driver_id", "plate", "model", "color"],
  "parking_station": ["id", "email", "password", "tin", "company_name", "tax_office", "address", "phone", "lots", "location", "name", "parking_type", "lang", "work_hours", "price_list", "discount", "info", "s_height", "s_length", "s_covered", "s_keys", "s_card", "s_charger", "s_english", "s_camera", "s_wash"],
  "parking_lot": ["id", "parking_station_id"],
  "reservation": ["id", "car_id", "parking_lot_id", "r_start", "r_end", "price", "state"],
  "review": ["id", "parking_station_id", "stars", "description"],
  "notification": ["id", "user_id", "date_created", "viewed", "message"],
  "sensor_data": ["id", "value", "plate"]
};
const schema_required = {
  "driver": ["email", "password", "name", "phone"],
  "car": ["driver_id", "plate", "model", "color"],
  "parking_station": ["email", "password", "tin", "company_name", "tax_office", "address", "phone", "lots", "location", "name", "parking_type", "work_hours", "price_list", "info", "s_height", "s_length", "s_covered", "s_keys", "s_card", "s_charger", "s_english", "s_camera", "s_wash"],
  "parking_lot": ["parking_station_id"],
  "reservation": ["car_id", "parking_lot_id", "r_start", "r_end", "price"],
  "review": ["parking_station_id", "stars", "description"],
  "notification": ["user_id", "date_created", "message"],
  "sensor_data": ["id", "value", "plate"]
};
const schema_show = { //? , "lang";;;;;;;
  "driver": ["email", "name", "phone", "points"],
  "car": ["plate", "model", "color"],
  // "parking_station": ["address", "phone", "location", "name", "parking_type", "work_hours", "price_list", "discount", "info", "s_height", "s_length", "s_covered", "s_keys", "s_card", "s_charger", "s_english", "s_camera", "s_wash"],
  "parking_station": ["email", "tin", "company_name", "tax_office", "address", "phone", "lots", "location", "name", "parking_type", "work_hours", "price_list", "discount", "info", "s_height", "s_length", "s_covered", "s_keys", "s_card", "s_charger", "s_english", "s_camera", "s_wash"],
  "parking_lot": ["parking_station_id"],
  "reservation": ["car_id", "parking_lot_id", "r_start", "r_end", "price"],
  "review": ["parking_station_id", "stars", "description"],
  "notification": ["date_created", "viewed", "message"],
  "sensor_data": ["value", "plate"]
};
const schema_editable = {
  "driver": ["email", "name", "phone", "lang"],
  // "car": ["plate", "model", "color"],
  "car": ["model", "color"],
  "parking_station": ["email", "tin", "company_name", "tax_office", "address", "phone", "lots", "location", "name", "parking_type", "lang", "work_hours", "price_list", "discount", "info", "s_height", "s_length", "s_covered", "s_keys", "s_card", "s_charger", "s_english", "s_camera", "s_wash"],
  //"reservation": ["car_id", "r_start", "r_end", "price"],
  "reservation": ["price"],
  "review": ["stars", "description"],
  "notification": ["message"],
  "sensor_data": ["value", "plate"]
};
const schema_unique = {
  "driver": ["email", "phone"],
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
  sql += ";";
  conn.query(sql, function (err, data) {
    if (err) throw (err);
    if (cb) cb(data);
  });
};

function create_(table, vls, cb) {
  const fields = schema_required[table].join(", ");
  const values = "'" + vls.join("', '") + "'";
  const sql = `INSERT INTO ${table} (${fields}) VALUES (${values});`;
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
  //if (table === "reservation") pairs = `price = ${row.price}`;
  const sql = `UPDATE ${table} SET ${pairs} WHERE id = ${row.id};`;
  conn.query(sql, function (err, data) {
    if (err) throw (err);
    if (cb) cb(data);
  });
};
function change_pass(table, id, n_pass, cb) {
  const sql = `UPDATE ${table} SET password = "${n_pass}" WHERE id = ${id};`;
  conn.query(sql, function (err, data) {
    if (err) throw (err);
    if (cb) cb(JSON.parse(JSON.stringify(data))[0]);
  });
};
function update_state(id, st, dt, cb) {
  let d = "";
  if (st == 1) d = "r_start";
  else if (st == 2) d = "r_end";
  const sql = `UPDATE reservation SET state = ${st}, ${d} = ${dt} WHERE id = ${id}`;
  conn.query(sql, function (err, data) {
    if (err) throw (err);
    if (cb) cb(data);
  });
}

function delete_(table, id, cb) {
  const sql = `DELETE FROM ${table} WHERE id = ${id};`;
  conn.query(sql, function (err, data) {
    if (err) throw (err);
    if (cb) cb(data);
  });
};
// driver & parking authedication
function auth_(table, email, pass, cb) {
  const sql = `SELECT id, lang FROM ${table} WHERE email = "${email}" AND password = "${pass}";`;
  conn.query(sql, function (err, data) {
    if (err) throw (err);
    if (cb) cb(JSON.parse(JSON.stringify(data))[0]);
  });
};
// get columns of a specific row of a table
function get_(table, id, cb) {
  const fields = schema_show[table].join(", ");
  const sql = `SELECT ${fields} FROM ${table} WHERE id = "${id}";`;
  conn.query(sql, function (err, data) {
    if (err) throw (err);
    if (cb) cb(JSON.parse(JSON.stringify(data))[0]);
  });
};
// check if unique field already exist in database
function check_(table, id, fld, vl, cb) {
  const sql = `SELECT id FROM ${table} WHERE ${fld} = "${vl}" AND id != ${id};`;
  conn.query(sql, function (err, data) {
    if (err) throw (err);
    if (JSON.parse(JSON.stringify(data)).length) cb(false);
    else cb(true);
  });
};
// get columns of a specific row with id of a table 
function get2_(table, flds, id, cb) {
  const sql = `SELECT id, ${flds} FROM ${table} WHERE id = "${id}";`;
  conn.query(sql, function (err, data) {
    if (err) throw (err);
    if (cb) cb(JSON.parse(JSON.stringify(data))[0]);
  });
};

function read2_(cond, cb) {
  let sql = `SELECT ps.id, ps.name, ps.work_hours, ps.price_list, ps.location, ps.discount, rv.rating FROM (SELECT id, name, work_hours, price_list, location, discount FROM parking_station WHERE ${cond}) ps LEFT JOIN (SELECT parking_station_id, AVG(stars) AS rating FROM review GROUP BY parking_station_id) rv ON ps.id = rv.parking_station_id;`;
  conn.query(sql, function (err, data) {
    if (err) throw (err);
    if (cb) cb(data);
  });
};

// check if value already exist in database
function check2_(table, cond, cb) {
  const sql = `SELECT id FROM ${table} WHERE ${cond};`;
  conn.query(sql, function (err, data) {
    if (err) throw (err);
    if (cb) cb(JSON.parse(JSON.stringify(data))[0]);
  });
};

function load_reservation_history(md, id, cb) {
  let sql = ``;
  if (md === "driver") { sql = `SELECT rc.id, rc.parking_lot_id, rc.r_start, rc.r_end, rc.price, rc.plate, p.name, p.phone, p.address, p.id1, p.location FROM (SELECT r.id, r.parking_lot_id, r.r_start, r.r_end, r.price, c.plate, c.driver_id FROM (reservation r JOIN car c ON r.car_id=c.id) WHERE c.driver_id=${id}) rc JOIN (SELECT pl.id AS id2, ps.id AS id1, ps.name, ps.phone, ps.address, ps.location FROM (parking_lot pl JOIN parking_station ps ON pl.parking_station_id=ps.id)) p ON rc.parking_lot_id=p.id2 ORDER BY rc.r_end DESC, rc.r_start DESC;`; }
  // else if (md === "parking_station") { sql = ``; }
  conn.query(sql, function (err, data) {
    if (err) throw (err);
    if (cb) cb(data);
  });
};

function load_parking_station_current_reservations(id, now, cb) {
  let sql = `SELECT r.id, r.state, r.parking_lot_id, r.r_start, r.r_end, r.price, dc.email, dc.name, dc.phone, dc.plate, dc.model, dc.color FROM (SELECT * FROM reservation WHERE r_end > ${now} AND parking_lot_id IN (SELECT id FROM parking_lot WHERE parking_station_id = ${id})) r JOIN (SELECT d.email, d.name, d.phone, c.plate, c.model, c.color, c.id FROM driver d JOIN car c ON d.id = c.driver_id) dc ON r.car_id = dc.id ORDER BY r.r_start, r.r_end;`;
  conn.query(sql, function (err, data) {
    if (err) throw (err);
    if (cb) cb(data);
  });
};

function load_parking_station_reservations(id, cb) {
  let sql = `SELECT r.id, r.parking_lot_id, r.r_start, r.r_end, r.price, dc.email, dc.name, dc.phone, dc.plate, dc.model, dc.color FROM (SELECT * FROM reservation WHERE parking_lot_id IN (SELECT id FROM parking_lot WHERE parking_station_id = ${id})) r JOIN (SELECT d.email, d.name, d.phone, c.plate, c.model, c.color, c.id FROM driver d JOIN car c ON d.id = c.driver_id) dc ON r.car_id = dc.id ORDER BY r.r_end DESC, r.r_start DESC;`;
  conn.query(sql, function (err, data) {
    if (err) throw (err);
    if (cb) cb(data);
  });
};

function calculate_income(id, dt_start, dt_end, cb){
  let sql = `SELECT SUM(r.price) AS price FROM (reservation r JOIN parking_lot pl ON r.parking_lot_id = pl.id) WHERE pl.parking_station_id = ${id} AND r.r_end > ${dt_start} AND r.r_end < ${dt_end};`;
  conn.query(sql, function (err, data) {
    if (err) throw (err);
    if (cb) cb(data);
  });
};

function find_free_parking_lots_of_parking_station(_id, _start, _end, cb) {
  let sql = `SELECT id FROM parking_lot WHERE id NOT IN (SELECT parking_lot_id FROM reservation WHERE parking_lot_id IN (SELECT id FROM parking_lot WHERE parking_station_id = ${_id}) AND ${_start} < r_end AND ${_end} > r_start) AND parking_station_id = ${_id};`;
  conn.query(sql, function (err, data) {
    if (err) throw (err);
    if (cb) cb(data);
  });
};

function find_free_parking_lots_of_parking_station2(_id, _start, _end, cb) {
  let sql = `SELECT pl.id, ps.work_hours FROM (parking_lot pl JOIN parking_station ps ON pl.parking_station_id = ps.id) WHERE pl.id NOT IN (SELECT parking_lot_id FROM reservation WHERE parking_lot_id IN (SELECT id FROM parking_lot WHERE parking_station_id = ${_id}) AND ${_start} < r_end AND ${_end} > r_start) AND parking_station_id = ${_id};`;
  conn.query(sql, function (err, data) {
    if (err) throw (err);
    if (cb) cb(data);
  });
};

function add_review(id, ps_id, star, desc, cb) {
  const sql1 = `SELECT id FROM review WHERE id = ${id};`;
  conn.query(sql1, function (err, data) {
    if (err) throw (err);
    if (JSON.parse(JSON.stringify(data)).length) {
      const sql2 = `UPDATE review SET stars=${star}, description='${desc}' WHERE id=${id};`;
      conn.query(sql2, function (err, data) {
        if (err) throw (err);
        if (cb) cb(data);
      });
    }
    else {
      const sql3 = `INSERT INTO review VALUES (${id}, ${ps_id}, ${star}, '${desc}');`;
      conn.query(sql3, function (err, data) {
        if (err) throw (err);
        if (cb) cb(data);
      });
    }
  });
};

function update_points(id, pts, cb) {
  const sql = `UPDATE driver SET points = points + ${pts} WHERE id = ${id};`;
  conn.query(sql, function (err, data) {
    if (err) throw (err);
    if (cb) cb(data);
  });
};

function update_ps_driver(id, ps_id, cb) {
  const sql = `UPDATE driver SET parking_station_id = '${ps_id}' WHERE id = ${id};`;
  conn.query(sql, function (err, data) {
    if (err) throw (err);
    if (cb) cb(data);
  });
};

// function add_new_reservation(vls, cb) {
//   const sql = `INSERT INTO reservation (car_id, parking_lot_id, r_start, r_end, price) VALUES (${vls});`;
//   conn.query(sql, function (err, data) {
//     if (err) throw (err);
//     if (cb) cb(data);
//   });
// };

// - ?????????????????????????????????????
function get_parking_evaluation(id, cb) {
  const sql = `SELECT AVG(stars) FROM review WHERE parking_id = ${id};`;
  //const sql = `SELECT AVG(stars) FROM review WHERE id IN (SELECT id FROM reservation WHERE parking_lot_id IN (SELECT id FROM parking_lot WHERE parking_station_id = ${id}));`;
  conn.query(sql, function (err, data) {
    if (err) throw (err);
    if (cb) cb(JSON.parse(JSON.stringify(data))[0]);
  });
};

function read_all_user_notifications(id, cb){
  const sql = `UPDATE notification SET viewed = 1 WHERE user_id = '${id}';`;
  conn.query(sql, function (err, data) {
    if (err) throw (err);
    if (cb) cb(data);
  });
};

function read_parking_station_from_reservation(id, cb){
  const sql = `SELECT parking_station_id FROM (reservation r LEFT JOIN parking_lot pl ON r.parking_lot_id = pl.id) WHERE r.id = ${id};`;
  conn.query(sql, function (err, data) {
    if (err) throw (err);
    if (cb) cb(JSON.parse(JSON.stringify(data))[0].parking_station_id);
  });
};

function read_driver_from_reservation(id, cb){
  const sql = `SELECT driver_id FROM (reservation r LEFT JOIN car c ON r.car_id = c.id) WHERE r.id = ${id};`;
  conn.query(sql, function (err, data) {
    if (err) throw (err);
    if (cb) cb(JSON.parse(JSON.stringify(data))[0].driver_id);
  });
};

function add_notification(u_id, dt, msg, cb){
  const fields = schema_required.notification.join(", ");
  const sql = `INSERT INTO notification (${fields}) VALUES (${u_id}, ${dt}, ${msg});`;
  conn.query(sql, function (err, data) {
    if (err) throw (err);
    if (cb) cb(data);
  });
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
  change_pass,
  update_state,
  delete_,
  auth_,
  get_,
  read2_,
  check_,
  load_reservation_history,
  add_review,
  update_points,
  update_ps_driver,
  load_parking_station_current_reservations,
  load_parking_station_reservations,
  find_free_parking_lots_of_parking_station,
  find_free_parking_lots_of_parking_station2,
  calculate_income,
  get2_,
  check2_,
  get_parking_evaluation,
  read_all_user_notifications,
  add_notification,
  read_parking_station_from_reservation,
  read_driver_from_reservation
}