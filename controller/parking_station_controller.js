'use strict';
// const dataModel = require('../models/sqlite_data_model.js');
const dataModel = require('../models/mysql_data_model.js');

// regex patterns
const mail_regex = /^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$/;
const password_regex = /(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{8,}/;
const phone_regex = /[0-9]{10}/;

function get_parking_station_home_page(req, res) {
    if (req.session.sid === undefined) {
        console.log("To see home page you must sign in first");
        res.redirect('/parking_station/sign_in');
    }
    else {
        dataModel.get_("parking_station", req.session.sid, function (data) { // check if id exists
            if (data) {
                let n_dt = new Date();
                n_dt = n_dt.getTime();
                dataModel.load_parking_station_current_reservations(req.session.sid, n_dt, function (data) {
                    const dt = JSON.parse(JSON.stringify(data));
                    let cl = 0;
                    for (let el of dt) if (el.r_start < n_dt) cl++;
                    dataModel.get2_("parking_station", "lots", req.session.sid, function (data2) {
                        let dt2 = JSON.parse(JSON.stringify(data2));
                        let per = parseInt(100 * parseFloat(cl) / parseFloat(dt2.lots));
                        //dataModel.find_free_parking_lots_of_parking_station(req.session.sid,Date.parse(),Date.parse());
                        res.render('parking_station/home', {
                            records: dt,
                            pl_per: per,
                            form_data: false,
                            empty_lots: false, //! had to be found from db
                            "is_driver": false,
                            "login": (req.session.sid !== undefined),
                            'lang': req.session.lang
                        });
                    });
                });

            }
        });
    }
};

function search_parking_station_new_reservation(req, res) {
    if (req.session.sid === undefined) {
        console.log("To see home page you must sign in first");
        res.redirect('/parking_station/sign_in');
    }
    else {
        dataModel.get_("parking_station", req.session.sid, function (data) { // check if id exists
            if (data) {
                let n_dt = new Date();
                n_dt = n_dt.getTime();
                dataModel.load_parking_station_current_reservations(req.session.sid, n_dt, function (data) {
                    const dt = JSON.parse(JSON.stringify(data));
                    let cl = 0;
                    for (let el of dt) if (el.r_start < n_dt) cl++;
                    dataModel.get2_("parking_station", "lots", req.session.sid, function (data2) { // get number of all parking lots
                        let dt2 = JSON.parse(JSON.stringify(data2));
                        let per = parseInt(100 * parseFloat(cl) / parseFloat(dt2.lots));
                        dataModel.find_free_parking_lots_of_parking_station(req.session.sid, Date.parse(req.body.r_start), Date.parse(req.body.r_end), function (data3) {
                            const dt3 = JSON.parse(JSON.stringify(data3));
                            let e_lots = [];
                            for (let el of dt3) e_lots.push(el.id);
                            let f_dt = {};
                            let flds = ["email", "name", "phone", "plate", "model", "color", "r_start", "r_end", "price"];
                            for (let field of flds) f_dt[field] = req.body[field];
                            res.render('parking_station/home', {
                                records: dt,
                                pl_per: per,
                                empty_lots: e_lots,
                                form_data: JSON.stringify(f_dt),
                                "is_driver": false,
                                "login": (req.session.sid !== undefined),
                                'lang': req.session.lang
                            });
                        });
                    });
                });

            }
        });
    }
};

function add_reservation(req, res) {

    if (req.session.sid !== undefined) {
        // add user
        let new_driver = {};
        for (let field of dataModel.schema_required["driver"]) {
            if (field === "password") {
                new_driver[field] = "dummy";
            }
            else new_driver[field] = req.body[field]; // dynamically get driver keys and values
        }
        // check fields agree with patterns
        let fields_check = true;
        if (!mail_regex.test(new_driver.email)) fields_check = false;
        if (!phone_regex.test(new_driver.phone)) fields_check = false;
        // add car

        // add reservation
        if (fields_check) {
            // check if driver already exists (email and phone)
            dataModel.read_("driver", "email", `email = "${new_driver.email}"`, function (data) { // check if email exists
            //!dataModel.check2_("driver", `email = ${new_driver.email}`, function (data) {
                if (Object.keys(data).length === 0) { // if email not found in database
                    dataModel.read_("driver", "phone", `phone = "${new_driver.phone}"`, function (data2) { // check if phone exists
                    //!dataModel.check2_("driver", `phone = ${new_driver.phone}`, function (data2) {
                        if (Object.keys(data2).length === 0) { // phone not found in database
                            // insert new_driver to database
                            const required_values = Object.values(new_driver); // put required values in an array
                            dataModel.create_("driver", required_values, function () {
                                dataModel.check2_("driver", `email = "${new_driver.email}"`, function (data3) {
                                    console.log("New driver added succesfully");
                                    let car = {};
                                    for (let field of dataModel.schema_required["car"]) { // dynamically get car keys and values
                                        if (field === "driver_id") car[field] = data3.id;
                                        else car[field] = req.body[field];
                                    }
                                    dataModel.check2_("car", `plate = "${car.plate}"`, function (data4) {
                                        if (!data4) {
                                            const vls = Object.values(car);
                                            dataModel.create_("car", vls, function () {
                                                dataModel.check2_("car", `plate = "${car.plate}"`, function (data4) {
                                                    console.log("New car added succesfully");
                                                    let resv = {};
                                                    for (let field of dataModel.schema_required["reservation"]) { // dynamically get car keys and values
                                                        if (field === "car_id") resv[field] = data4.id;
                                                        else if (field === "r_start") resv[field] = Date.parse(req.body.r_start);
                                                        else if (field === "r_end") resv[field] = Date.parse(req.body.r_end);
                                                        else resv[field] = req.body[field];
                                                    }
                                                    const req_values = Object.values(resv);
                                                    dataModel.create_("reservation", req_values, function () {
                                                        console.log("Reservation booked");
                                                        res.redirect('/parking_station/home'); //res.redirect("back");
                                                    });
                                                });
                                            });
                                        }
                                        else {
                                            console.log("Car is already in database");
                                            res.redirect('/parking_station/home'); //res.redirect("back");
                                        }
                                    });
                                });

                            });
                        }
                        else { // phone found in database
                            console.log("Phone already exist");
                            res.redirect('/parking_station/home'); //res.redirect("back");
                        }
                    });
                }
                else {
                    console.log("Email already exist");
                    res.redirect('/parking_station/home'); //res.redirect("back");
                }
            });
        }
        else {
            console.log("Fields check failed");
            res.redirect('/parking_station/home'); //res.redirect("back");
        }
    }
    else {
        console.log("important error!");
        res.redirect('/parking_station/sign_in');
    }
};

function get_parking_station_my_parking_page(req, res) {
    res.render('parking_station/my_parking', {
        "is_driver": false,
        "login": (req.session.sid !== undefined),
        'lang': req.session.lang
    });
};

function get_parking_station_info_page(req, res) {
    res.render('parking_station/info', {
        "is_driver": false,
        "login": (req.session.sid !== undefined),
        'lang': req.session.lang
    });
};

module.exports = {
    get_parking_station_home_page,
    search_parking_station_new_reservation,
    get_parking_station_my_parking_page,
    get_parking_station_info_page,
    add_reservation
}