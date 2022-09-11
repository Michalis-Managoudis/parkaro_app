'use strict';
// const dataModel = require('../models/sqlite_data_model.js');
const dataModel = require('../models/mysql_data_model.js');


function get_user_home_page(req, res) {
    dataModel.read_("parking_station", "id, location", "type = 0", function (rows) {
        rows.map(function (row) { row.location = row.location.split("/").map(parseFloat); });
        res.render('user/home', {
            "is_user": true,
            "login": (req.session.sid !== undefined),
            'lang': req.session.lang,
            parking_station_locations: JSON.stringify(rows)
        });
    });
}; 

function get_user_city_page(req, res) {
    // dataModel2.query("SELECT * FROM user", function (err, data) {
    //     if (err) throw (err);
    //     console.log(data);
    // });
    dataModel.read_("parking_station", "id, location", "type = 0", function (rows) {
        rows.map(function (row) { row.location = row.location.split("/").map(parseFloat); });
        res.render('user/city', {
            "is_user": true,
            "login": (req.session.sid !== undefined),
            'lang': req.session.lang,
            parking_station_locations: JSON.stringify(rows)
        });
    });

};
function get_user_airport_page(req, res) {
    dataModel.read_("parking_station", "id, location", "type = 0", function (rows) {
        rows.map(function (row) { row.location = row.location.split("/").map(parseFloat); });
        res.render('user/airport', {
            "is_user": true,
            "login": (req.session.sid !== undefined),
            'lang': req.session.lang,
            parking_station_locations: JSON.stringify(rows)
        });
    });
};
function get_user_port_page(req, res) {
    dataModel.read_("parking_station", "id, location", "type = 0", function (rows) {
        rows.map(function (row) { row.location = row.location.split("/").map(parseFloat); });
        res.render('user/port', {
            "is_user": true,
            "login": (req.session.sid !== undefined),
            'lang': req.session.lang,
            parking_station_locations: JSON.stringify(rows)
        });
    });
};

function get_user_info_page(req, res) {
    // console.log(req.session.lang);
    res.render('user/info', {
        "is_user": true,
        "login": (req.session.sid !== undefined),
        'lang': req.session.lang
    });
};

function get_user_book_page(req, res) {
    dataModel.read_("parking_station", "id, location", "type = 0", function (rows) {
        rows.map(function (row) { row.location = row.location.split("/").map(parseFloat); });
        res.render('user/airport', {
            "is_user": true,
            "login": (req.session.sid !== undefined),
            'lang': req.session.lang,
            parking_station_locations: JSON.stringify(rows)
        });
    });
};

module.exports = {
    get_user_info_page,
    get_user_home_page,
    get_user_city_page,
    get_user_airport_page,
    get_user_port_page,
    get_user_book_page
}