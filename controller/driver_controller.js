'use strict';
// const dataModel = require('../models/sqlite_data_model.js');
const dataModel = require('../models/mysql_data_model.js');


function get_driver_home_page(req, res) {
    dataModel.read_("parking_station", "id, location", "parking_type = 0", function (rows) {
        rows.map(function (row) { row.location = row.location.split("/").map(parseFloat); });
        res.render('driver/home', {
            "is_driver": true,
            "login": (req.session.sid !== undefined),
            'lang': req.session.lang,
            parking_station_locations: JSON.stringify(rows)
        });
    });
};


function get_driver_city_page(req, res) {
    // dataModel2.query("SELECT * FROM driver", function (err, data) {
    //     if (err) throw (err);
    //     console.log(data);
    // });
    dataModel.read_("parking_station", "id, location", "parking_type = 0", function (rows) {
        rows.map(function (row) { row.location = row.location.split("/").map(parseFloat); });
        res.render('driver/city', {
            "is_driver": true,
            "login": (req.session.sid !== undefined),
            'lang': req.session.lang,
            parking_station_locations: JSON.stringify(rows)
        });
    });

};


function get_driver_airport_page(req, res) {
    dataModel.read_("parking_station", "id, location", "parking_type = 0", function (rows) {
        rows.map(function (row) { row.location = row.location.split("/").map(parseFloat); });
        res.render('driver/airport', {
            "is_driver": true,
            "login": (req.session.sid !== undefined),
            'lang': req.session.lang,
            parking_station_locations: JSON.stringify(rows)
        });
    });
};
function get_driver_port_page(req, res) {
    dataModel.read_("parking_station", "id, location", "parking_type = 0", function (rows) {
        rows.map(function (row) { row.location = row.location.split("/").map(parseFloat); });
        res.render('driver/port', {
            "is_driver": true,
            "login": (req.session.sid !== undefined),
            'lang': req.session.lang,
            parking_station_locations: JSON.stringify(rows)
        });
    });
};

function get_driver_info_page(req, res) {
    // console.log(req.session.lang);
    res.render('driver/info', {
        "is_driver": true,
        "login": (req.session.sid !== undefined),
        'lang': req.session.lang
    });
};

function get_driver_book_page(req, res) {
    if (req.session.sid === undefined) {
        console.log("To add a reservation you must sign in first");
        res.redirect('/sign_in')
    }
    else {
        const ps_id = req.params.ps_id;
        dataModel.get2_("parking_station", "name, location, photo, phone", ps_id, function (ps) {
            ps.location = ps.location.split("/")[1] + "," + ps.location.split("/")[0];
            if (req.session.sid === undefined) {
                res.render('driver/book', {
                    parking_station: ps,
                    "is_driver": true,
                    "login": (req.session.sid !== undefined),
                    'lang': req.session.lang
                });
            }
            else {
                dataModel.get_("driver", req.session.sid, function (data) {
                        if (data) {
                            dataModel.read_("car", "plate, model, color", `driver_id=${req.session.sid}`, function (cars) {
                            res.render('driver/book', {
                                parking_station: ps,
                                driver_car: cars,
                                driver: data,
                                "is_driver": true,
                                "login": (req.session.sid !== undefined),
                                'lang': req.session.lang
                            });
                        })
                    }
                });
            }
        });
    }

};

function add_driver_review(req, res) {
    if (req.session.sid === undefined) {
        console.log("To add a review you must sign in first");
        res.redirect('/sign_in')
    }
    else {
        const res_id = req.params.res_id;
        const ps_id = req.params.ps_id;
        const stars = req.body.stars;
        const description = req.body.description;
        dataModel.add_review(res_id, ps_id, stars, description, function () {
            console.log("Review added/updated succesfully");
            res.redirect('/history');
        });
    }
};

function add_driver_reservation(req, res) {
    if (req.session.sid === undefined) {
        console.log("To add a reservation you must sign in first");
        res.redirect('/sign_in')
    }
    else {
        const ps_id = req.params.ps_id;
        let resv = {};
        resv.car_id = req.body.car;
        resv.pl_id = 1;
        resv.r_start = req.body.s_date + " " + req.body.s_time;
        resv.r_end = req.body.e_date + " " + req.body.e_time;
        resv.price = 5.2;
        // const required_values = "'" + Object.values(resv).join("', '") + "'";
        // dataModel.add_new_reservation(required_values, function () {
        //     res.redirect('/history');
        // });
        const required_values = Object.values(resv);
        dataModel.create_("reservation", required_values, function () {
            res.redirect('/history');
        });
    }
};

module.exports = {
    get_driver_info_page,
    get_driver_home_page,
    get_driver_city_page,
    get_driver_airport_page,
    get_driver_port_page,
    get_driver_book_page,
    add_driver_review,
    add_driver_reservation
}