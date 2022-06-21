'use strict';
var dataModel = require('../models/sqlite_data_model.js');


function get_user_home_page(req, res) {
    res.render('user/home', {
        "is_user": true,
        "login": (req.session.sid !== undefined),
        'lang': req.session.lang
    });
};

function get_user_city_page(req, res) {
    res.render('user/city', {
        "is_user": true,
        "login": (req.session.sid !== undefined),
        'lang': req.session.lang
    });
};
function get_user_airport_page(req, res) {
    res.render('user/airport', {
        "is_user": true,
        "login": (req.session.sid !== undefined),
        'lang': req.session.lang
    });
};
function get_user_port_page(req, res) {
    res.render('user/port', {
        "is_user": true,
        "login": (req.session.sid !== undefined),
        'lang': req.session.lang
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

module.exports = {
    get_user_info_page,
    get_user_home_page,
    get_user_city_page,
    get_user_airport_page,
    get_user_port_page
}