'use strict';
// const dataModel = require('../models/sqlite_data_model.js');
const dataModel = require('../models/mysql_data_model.js');

function get_parking_station_home_page(req, res) {
    res.render('parking_station/home', {
        "is_user": false,
        "login": (req.session.sid !== undefined),
        'lang': req.session.lang
    });
};

function get_parking_station_info_page(req, res) {
    res.render('parking_station/info', {
        "is_user": false,
        "login": (req.session.sid !== undefined),
        'lang': req.session.lang
    });
};

module.exports = {
    get_parking_station_home_page,
    get_parking_station_info_page
}