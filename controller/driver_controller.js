'use strict';
// const dataModel = require('../models/sqlite_data_model.js');
const dataModel = require('../models/mysql_data_model.js');

function get_driver_home_page(req, res) {
    // if (req.session._dts) {
    //     if (req.session._dts.start != undefined && req.session._dts.end != undefined) {
    //         req.session._ready_to_add_reservation = false;
    //     }
    // }
    dataModel.read_("parking_station", "id, location", "parking_type = 0", function (rows) {
        rows.map(function (row) { row.location = row.location.split("/").map(parseFloat); });
        res.render('driver/home', {
            "is_driver": true,
            "login": (req.session.sid !== undefined),
            'lang': req.session.lang,
            dates: req.session._dts,
            parking_station_locations: JSON.stringify(rows)
        });
    });
};

function get_driver_city_page(req, res) {
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
    dataModel.read_("parking_station", "id, location", "parking_type = 1", function (rows) {
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
    dataModel.read_("parking_station", "id, location", "parking_type = 2", function (rows) {
        rows.map(function (row) { row.location = row.location.split("/").map(parseFloat); });
        res.render('driver/port', {
            "is_driver": true,
            "login": (req.session.sid !== undefined),
            'lang': req.session.lang,
            parking_station_locations: JSON.stringify(rows)
        });
    });
};

function search_driver_home_page(req, res) {
    req.session._dts = {"start": req.body.s_dttm,"end": req.body.e_dttm};
    req.session._ready_to_add_reservation = true;
    let cond = `parking_type = 0 AND id IN (SELECT DISTINCT parking_station_id FROM parking_lot WHERE id NOT IN (SELECT parking_lot_id FROM reservation WHERE (${Date.parse(req.session._dts.start+"Z")} < r_end AND ${Date.parse(req.session._dts.end+"Z")} > r_start)))`;
    dataModel.read_("parking_station", "id, location", cond, function (rows) {
        rows.map(function (row) { row.location = row.location.split("/").map(parseFloat); });
        res.render('driver/home', {
            "is_driver": true,
            "login": (req.session.sid !== undefined),
            'lang': req.session.lang,
            dates: req.session._dts,
            parking_station_locations: JSON.stringify(rows)
        });
    });
};

function search_driver_airport_page(req, res) {
    req.session._dts = {"start": req.body.s_dttm,"end": req.body.e_dttm};
    req.session._ready_to_add_reservation = true;
    let cond = `parking_type = 1 AND id IN (SELECT DISTINCT parking_station_id FROM parking_lot WHERE id NOT IN (SELECT parking_lot_id FROM reservation WHERE (${Date.parse(req.session._dts.start+"Z")} < r_end AND ${Date.parse(req.session._dts.end+"Z")} > r_start)))`;
    dataModel.read_("parking_station", "id, location", cond, function (rows) {
        rows.map(function (row) { row.location = row.location.split("/").map(parseFloat); });
        res.render('driver/home', {
            "is_driver": true,
            "login": (req.session.sid !== undefined),
            'lang': req.session.lang,
            dates: req.session._dts,
            parking_station_locations: JSON.stringify(rows)
        });
    });
};

function search_driver_port_page(req, res) {
    req.session._dts = {"start": req.body.s_dttm,"end": req.body.e_dttm};
    req.session._ready_to_add_reservation = true;
    let cond = `parking_type = 2 AND id IN (SELECT DISTINCT parking_station_id FROM parking_lot WHERE id NOT IN (SELECT parking_lot_id FROM reservation WHERE (${Date.parse(req.session._dts.start+"Z")} < r_end AND ${Date.parse(req.session._dts.end+"Z")} > r_start)))`;
    dataModel.read_("parking_station", "id, location", cond, function (rows) {
        rows.map(function (row) { row.location = row.location.split("/").map(parseFloat); });
        res.render('driver/home', {
            "is_driver": true,
            "login": (req.session.sid !== undefined),
            'lang': req.session.lang,
            dates: req.session._dts,
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
        //const ps_id = req.params.ps_id;
        req.session.ps_id = req.params.ps_id;
        dataModel.get2_("parking_station", "name, location, photo, phone", req.session.ps_id, function (ps) {
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

                //!
                // const ps_id = req.session.ps_id;
                // req.session._dts = {"start": req.body.s_date,"end": req.body.e_date};
                // let cond = `parking_station_id = ${ps_id} AND id NOT IN (SELECT parking_lot_id FROM reservation WHERE (${Date.parse(req.session._dts.start+"Z")} < r_end AND ${Date.parse(req.session._dts.end+"Z")} > r_start)) LIMIT 1`;
                // dataModel.read_("parking_lot", "", cond, function (ids) {
                //     let _id = JSON.parse(JSON.stringify(ids));
                //     if (_id[0] === undefined) {
                //         req.session._ready_to_add_reservation = false;
                //         console.log("Can't find an available parking space try again other datetimes or another parking station!!");
                //     }
                //     else {
                //         req.session._ready_to_add_reservation = true;
                //         console.log("find an available parking space");
                //     }
                //!

                dataModel.get_("driver", req.session.sid, function (data) {
                    if (data) {
                        dataModel.read_("car", "plate, model, color", `driver_id=${req.session.sid}`, function (cars) {
                            res.render('driver/book', {
                                parking_station: ps,
                                driver_car: cars,
                                driver: data,
                                dates: req.session._dts,
                                "is_driver": true,
                                "found": req.session._ready_to_add_reservation,
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
        const ps_id = req.session.ps_id;
        let resv = {};
        resv.car_id = req.body.car;
        
        let cond = `parking_station_id = ${ps_id} AND id NOT IN (SELECT parking_lot_id FROM reservation WHERE (${Date.parse(req.body.s_date+"Z")} < r_end AND ${Date.parse(req.body.e_date+"Z")} > r_start)) LIMIT 1`;
        dataModel.read_("parking_lot", "", cond, function (ids) {
            let _id = JSON.parse(JSON.stringify(ids));
            if (_id[0] === undefined) {
                req.session._ready_to_add_reservation = false;
                console.log("Can't find an available parking space try again other datetimes or another parking station");
                res.redirect('/home');
            }
            else{
                _id = _id[0].id;
                resv.pl_id = _id;
                resv.r_start = Date.parse(req.body.s_date); //new Date(req.body.s_date).getTime();
                resv.r_end = Date.parse(req.body.e_date); //new Date(req.body.e_date).getTime();
                resv.price = 10 * (new Date(req.body.e_date) - new Date(req.body.s_date)) / 3600000;
                // const required_values = "'" + Object.values(resv).join("', '") + "'";
                // dataModel.add_new_reservation(required_values, function () {
                //     res.redirect('/history');
                // });
                const required_values = Object.values(resv);
                req.session._ready_to_add_reservation = false;
                // req.session._dts = {};
                dataModel.create_("reservation", required_values, function () {
                    console.log("Reservation booked");
                    res.redirect('/history');
                });
            }
        });
    }
};

function check_reservation_availability(req,res) {
    const ps_id = req.session.ps_id;
    req.session._dts = {"start": req.body.s_date,"end": req.body.e_date};
    let cond = `parking_station_id = ${ps_id} AND id NOT IN (SELECT parking_lot_id FROM reservation WHERE (${Date.parse(req.session._dts.start+"Z")} < r_end AND ${Date.parse(req.session._dts.end+"Z")} > r_start)) LIMIT 1`;
    dataModel.read_("parking_lot", "", cond, function (ids) {
        let _id = JSON.parse(JSON.stringify(ids));
        if (_id[0] === undefined) {
            req.session._ready_to_add_reservation = false;
            console.log("Can't find an available parking space try again other datetimes or another parking station!!");
        }
        else {
            req.session._ready_to_add_reservation = true;
            console.log("find an available parking space");
        }
        res.redirect('back');
    });
};

module.exports = {
    get_driver_info_page,
    get_driver_home_page,
    get_driver_city_page,
    get_driver_airport_page,
    search_driver_home_page,
    search_driver_airport_page,
    search_driver_port_page,
    get_driver_port_page,
    get_driver_book_page,
    add_driver_review,
    add_driver_reservation,
    check_reservation_availability
}