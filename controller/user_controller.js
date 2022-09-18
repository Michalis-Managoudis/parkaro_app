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
    const ps_id = req.params.ps_id;
    console.log(ps_id);
    dataModel.get2_("parking_station", "name, location, photo, phone",ps_id, function (ps) {
        ps.location = ps.location.split("/")[1]+","+ps.location.split("/")[0];
        console.log(ps.location);
        if (req.session.sid === undefined) {
            res.render('user/book', {
                parking_station: ps,
                "is_user": true,
                "login": (req.session.sid !== undefined),
                'lang': req.session.lang
            });
        }
        else {
            dataModel.get_("user", req.session.sid, function (data) { // check if email exists
                dataModel.read_("car","plate, model, color", `user_id=${req.session.sid}`, function (cars) {
                    if (data) {
                        res.render('user/book', {
                            parking_station: ps,
                            user_car: cars,
                            user: data,
                            "is_user": true,
                            "login": (req.session.sid !== undefined),
                            'lang': req.session.lang
                        });
                    }
                })
            });
        }
    });
};

function get_user_review_page(req, res) {
    const res_id = req.params.res_id;
    const ps_id = req.params.ps_id;
    const stars = req.body.stars;
    const description = req.body.description;
    dataModel.add_review(res_id, ps_id, stars, description, function () {
        console.log("Review added/updated succesfully");
        res.redirect('/history');
    });
};


function add_user_reservation(req, res) {
    const ps_id = req.params.ps_id;
    let resv = {};
    resv.car_id = req.body.car;
    resv.pl_id = 1;
    resv.r_start = req.body.s_date + " " + req.body.s_time;
    resv.r_end = req.body.e_date + " " + req.body.e_time;
    resv.price = 5.2;
    
    // for (let field of dataModel.schema_required["reservation"]) resv[field] = req.body[field]; // dynamically get user keys and values
    const required_values = "'" + Object.values(resv).join("', '") + "'";
    dataModel.add_new_reservation(required_values, function () {
        res.redirect('/history');
    });
};

module.exports = {
    get_user_info_page,
    get_user_home_page,
    get_user_city_page,
    get_user_airport_page,
    get_user_port_page,
    get_user_book_page,
    get_user_review_page,
    add_user_reservation
}