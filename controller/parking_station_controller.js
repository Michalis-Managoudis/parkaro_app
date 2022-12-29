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
                            empty_lots: false,
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

function search_parking_station_reservation_availability(req, res) {
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

function add_parking_station_reservation(req, res) {
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

        // add reservation
        if (fields_check) {
            // check if driver already exists (email and phone)
            dataModel.check2_("driver", `email = "${new_driver.email}"`, function (data) {  // check if email exists
                if (!data) { // if email not found in database
                    dataModel.check2_("driver", `phone = "${new_driver.phone}"`, function (data2) { // check if phone exists
                        if (!data2) { // phone not found in database
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
                                            // add car
                                            const vls = Object.values(car);
                                            dataModel.create_("car", vls, function () {
                                                dataModel.check2_("car", `plate = "${car.plate}"`, function (data5) {
                                                    console.log("New car added succesfully");
                                                    let resv = {};
                                                    for (let field of dataModel.schema_required["reservation"]) { // dynamically get car keys and values
                                                        if (field === "car_id") resv[field] = data5.id;
                                                        else if (field === "r_start") resv[field] = Date.parse(req.body.r_start);
                                                        else if (field === "r_end") resv[field] = Date.parse(req.body.r_end);
                                                        else resv[field] = req.body[field];
                                                    }
                                                    const req_values = Object.values(resv);
                                                    dataModel.create_("reservation", req_values, function () {
                                                        dataModel.update_points(data3.id, parseInt(resv.price / 10), function () {
                                                            console.log("Reservation booked");
                                                            res.redirect('/parking_station/home'); //res.redirect("back");
                                                        });

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
    if (req.session.sid === undefined) {
        console.log("To see home page you must sign in first");
        res.redirect('/parking_station/sign_in');
    }
    else {
        dataModel.get_("parking_station", req.session.sid, function (data) { // check if id exists
            if (data) {
                dataModel.load_parking_station_reservations(req.session.sid, function (data) {
                    const dt = JSON.parse(JSON.stringify(data));
                    let today = new Date();
                    let tday = new Date();
                    let tod = tday.toLocaleDateString().split("/"); //! not right format
                    let tod2 = tod[2] + "-" + tod[1] + "-" + tod[0];
                    let dt_st = Date.parse(tod2 + "T00:00:00");
                    let dt_en = Date.parse(today);
                    dataModel.calculate_income(req.session.sid, dt_st, dt_en, function (data2) { // today income
                        const dt2 = JSON.parse(JSON.stringify(data2));
                        tday.setDate(tday.getMonth() - 1);
                        let tod3 = tday.toLocaleDateString().split("/"); //! not right format
                        let tod4 = tod3[2] + "-" + tod3[1] + "-" + tod3[0];
                        let dt_st = Date.parse(tod4 + "T00:00:00");
                        let dt_en = Date.parse(today);
                        dataModel.calculate_income(req.session.sid, dt_st, dt_en, function (data3) { // monthly income
                            const dt3 = JSON.parse(JSON.stringify(data3));
                            let incom = { "today": dt2[0].price, "monthly": dt3[0].price };
                            incom = JSON.stringify(incom);
                            dataModel.read_("review", "stars, description", `parking_station_id = ${req.session.sid}`, function (data_2) {
                                const dt_2 = JSON.parse(JSON.stringify(data_2));
                                let rvs = {};
                                for (let el2 of dt_2) { rvs[el2.id.toString()] = { "stars": el2.stars, "description": el2.description }; }
                                rvs = JSON.stringify(rvs);
                                res.render('parking_station/my_parking', {
                                    records: dt,
                                    income: incom,
                                    reviews: rvs,
                                    "is_driver": false,
                                    "login": (req.session.sid !== undefined),
                                    'lang': req.session.lang
                                });
                            });
                        });
                    });
                });

            }
        });
    }
};

function delete_parking_station_reservation(req, res) {
    if (req.session.sid === undefined) {
        console.log("To delete a reservation you must sign in first");
        res.redirect('/parking_station/sign_in');
    }
    else {
        dataModel.get_("reservation", req.body._id, function (data) { // check if reservation exists
            if (data) {
                //data = JSON.parse(JSON.stringify(data));
                dataModel.delete_("reservation", req.body._id, function () {
                    dataModel.check2_("driver", `email = "${req.body.d_email}"`, function (data2) {
                        const dt = JSON.parse(JSON.stringify(data2));
                        dataModel.update_points(dt.id, -parseInt(req.body._price / 10), function () {
                            console.log("Reservation deleted succesfully");
                            res.redirect('back');
                        });

                    });
                });
            }
        });
    }
};

function update_parking_station_reservation(req, res) {
    if (req.session.sid === undefined) {
        console.log("To update a reservation you must sign in first");
        res.redirect('/parking_station/sign_in');
    }
    else {
        dataModel.get_("reservation", req.body._id, function (data) { // check if reservation exists
            if (data) {
                const dt = JSON.parse(JSON.stringify(data));
                const prc = parseInt((req.body.price - dt.price) / 10);
                let rr = { "id": req.body._id, "price": req.body.price };
                dataModel.update_("reservation", rr, function () {
                    dataModel.check2_("driver", `email = "${req.body.d_email}"`, function (data2) {
                        const dt2 = JSON.parse(JSON.stringify(data2));
                        dataModel.update_points(dt2.id, prc, function () {
                            console.log("Reservation updated succesfully");
                            //res.redirect('/parking_station/my_parking');
                            res.redirect('back');
                        });
                    });
                });
            }
            else {
                console.log("Reservation not found");
                res.redirect('/parking_station/my_parking');
            }
        });
    }
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
    search_parking_station_reservation_availability,
    get_parking_station_my_parking_page,
    get_parking_station_info_page,
    delete_parking_station_reservation,
    update_parking_station_reservation,
    add_parking_station_reservation
}