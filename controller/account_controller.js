'use strict';
//const dataModel = require('../models/sqlite_data_model.js');
const dataModel = require('../models/mysql_data_model.js');

// regex patterns
const mail_regex = /^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$/;
const password_regex = /(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{8,}/;
const phone_regex = /[0-9]{10}/;
const tin_regex = /[0-9]+/;

function change_language(req, res) {
    if (req.session.lang === undefined) req.session.lang = true;
    else req.session.lang = !req.session.lang;
    res.redirect('back');
};

function get_driver_account_page(req, res) {
    if (req.session.sid === undefined) {
        console.log("To see account page you must sign in first");
        res.redirect('/sign_in');
    }
    else {
        dataModel.get_("driver", req.session.sid, function (data) { // check if email exists
            if (data) {
                dataModel.read_("car", "plate, model, color", `driver_id=${req.session.sid}`, function (cars1) {
                    res.render("driver/account", {
                        cars: cars1,
                        driver: data,
                        'is_driver': true,
                        'login': true,
                        'lang': req.session.lang
                    });
                });
            }
        });
    }

}
function get_parking_station_account_page(req, res) {
    if (req.session.sid === undefined) {
        console.log("To see account page you must sign in first");
        res.redirect('/parking_station/sign_in');
    }
    else {
        dataModel.get_("parking_station", req.session.sid, function (data) { // check if email exists
            if (data) {
                res.render("parking_station/account", {
                    ps_data: JSON.stringify(data),
                    //ps_data: data,
                    'is_driver': false,
                    'login': true,
                    'lang': req.session.lang
                });
            }
        });
    }

}

function update_driver_data(req, res) {
    if (req.session.sid === undefined) {
        console.log("important error!");
        res.redirect('/account');
    }
    else {
        let driver = {};
        for (let field of dataModel.schema_editable["driver"]) driver[field] = req.body[field]; // dynamically get driver keys and values
        // check fields agree with patterns
        let fields_check = true;
        if (!mail_regex.test(driver.email)) fields_check = false;
        if (!password_regex.test(driver.password)) fields_check = false;
        if (!phone_regex.test(driver.phone)) fields_check = false;
        if (!(driver.password===req.body.password2)) fields_check = false;
        //? if (!driver.name) fields_check = false;
        if (fields_check) {
            // check if driver already exists (email and phone)
            dataModel.check_("driver", req.session.sid, "email", driver.email, function (bool1) {
                if (bool1) {
                    dataModel.check_("driver", req.session.sid, "phone", driver.phone, function (bool2) {
                        if (bool2) {
                            driver.id = req.session.sid;
                            dataModel.update_("driver", driver, function () {
                                console.log("Data has been updated succesfully");
                                res.redirect("/account");
                            });

                        }
                        else {
                            console.log("Phone already exists");
                            res.redirect('/account');
                        }
                    });
                }
                else {
                    console.log("Email already exists");
                    res.redirect('/account');
                }
            });
        }
        else {
            console.log("Fields check failed");
            res.redirect('/account');
        }
    }

}
function update_parking_station_data(req, res) {
    if (req.session.sid === undefined) {
        console.log("important error!");
        res.redirect('/parking_station/account');
    }
    else {
        let parking_station = {};
        for (let field of dataModel.schema_editable["parking_station"]) {
            if (field == "work_hours") {
                parking_station.work_hours = "";
                for (let i = 1 ; i <= 7 ; i++) {
                    parking_station.work_hours = parking_station.work_hours + req.body["work_hours"+i] + "-" + req.body["work_hours"+i+"b"];
                    if (i !== 7) parking_station.work_hours = parking_station.work_hours + ",";
                }
            }
            else if (field == "price_list") {
                parking_station.price_list = "h";
                for (let i = 1 ; i <= 12 ; i++) {
                    parking_station.price_list = parking_station.price_list + req.body["price_list"+i];
                    if (i === 4) parking_station.price_list = parking_station.price_list + "d";
                    else if (i === 8) parking_station.price_list = parking_station.price_list + "m";
                    else if (i !== 12) parking_station.price_list = parking_station.price_list + ",";
                }
            } else {
                parking_station[field] = req.body[field]; // dynamically get driver keys and values
            }
        }
        parking_station.parking_type = parseInt(parking_station.parking_type);
        parking_station.tin = parseInt(parking_station.tin);
        parking_station.lots = parseInt(parking_station.lots);
        parking_station.s_height = parseFloat(parking_station.s_height);
        parking_station.s_length = parseFloat(parking_station.s_length);
        // check fields agree with patterns
        let fields_check = true;
        if (!mail_regex.test(parking_station.email)) fields_check = false;
        if (!password_regex.test(parking_station.password)) fields_check = false;
        if (!tin_regex.test(parking_station.tin)) fields_check = false;
        if (!phone_regex.test(parking_station.phone)) fields_check = false;
        if (!(parking_station.parking_type === 0 || parking_station.parking_type === 1 ||parking_station.parking_type === 2)) fields_check = false;
        if (!(parking_station.lots >= 0)) fields_check = false;
        if (!(parking_station.s_height > 0)) fields_check = false;
        if (!(parking_station.s_length > 0)) fields_check = false;
        for (let field of dataModel.schema_parking_station_boolean) {
            parking_station[field] = parseInt(parking_station[field]);
            if (!(parking_station[field] === 0 || parking_station[field] === 1)) fields_check = false;
        }
        //? if (!parking_station.name) fields_check = false;
        if (fields_check) {
            // check if driver already exists (email and phone)
            dataModel.check_("parking_station", req.session.sid, "email", parking_station.email, function (bool1) {
                if (bool1) {
                    dataModel.check_("parking_station", req.session.sid, "tin", parking_station.tin, function (bool2) {
                        if (bool2) {
                            parking_station.id = req.session.sid;
                            dataModel.get2_("parking_station", "lots", parking_station.id, function (data) {
                                let diff = parking_station.lots - data.lots;
                                if (diff >= 0) {
                                    for (let i = 0 ; i < diff ; i++) {
                                        dataModel.create_("parking_lot", [parking_station.id]);
                                    }
                                    dataModel.update_("parking_station", parking_station, function () {
                                        console.log("Data has been updated succesfully");
                                        res.redirect("/parking_station/account");
                                    });
                                }
                                else if (diff < 0) {
                                    //! for this version parking_station cann't decrease parking lots only increase
                                    console.log("Error - Can't decrease parking lots!");
                                    res.redirect('/parking_station/account');
                                }
                            });
                        }
                        else {
                            console.log("TIN already exists");
                            res.redirect('/parking_station/account');
                        }
                    });
                }
                else {
                    console.log("Email already exists");
                    res.redirect('/parking_station/account');
                }
            });
        };
    }

}

function delete_driver_account(req, res) {
    //! alert 
    if (req.session.sid === undefined) {
        console.log("important error!");
        res.redirect('/home');
    }
    else {
        dataModel.delete_("driver", req.session.sid, function () {
            req.session.sid = undefined;
            res.redirect('/home');
        });
    }

}
function delete_parking_station_account(req, res) {
    //! alert 
    if (req.session.sid === undefined) {
        console.log("important error!");
        res.redirect('/parking_station/home');
    }
    else {
        dataModel.delete_("parking_station", req.session.sid, function () {
            req.session.sid = undefined;
            res.redirect('/parking_station/home');
        });
    }

}

function get_driver_history_page(req, res) {
    if (req.session.sid === undefined) {
        console.log("To see history page you must sign in first");
        res.redirect('/sign_in');
    }
    else {
        dataModel.get_("driver", req.session.sid, function (data) { // check if id exists
            if (data) {
                dataModel.load_reservation_history("driver",req.session.sid, function (data) {
                    const dt = JSON.parse(JSON.stringify(data));
                    let ids = [];
                    for (let el of dt) {
                        el.location = el.location.split("/")[1] + "," + el.location.split("/")[0];
                        ids.push(el.id);
                        // el.r_start = el.r_start.replace("T"," ");
                        // el.r_end = el.r_end.replace("T"," ");
                    }
                    if (Object.keys(data).length !== 0) { // if driver has reservation history
                        dataModel.read_("review", "stars, description", `id IN (${ids.toString()})`, function (data_2) {
                            const dt_2 = JSON.parse(JSON.stringify(data_2));
                            let rvs = {};
                            for (let el2 of dt_2) {rvs[el2.id.toString()] = {"stars": el2.stars, "description": el2.description};}
                            rvs = JSON.stringify(rvs);
                            //dt = JSON.stringify(dt);
                            res.render('driver/history', {
                                records: dt,
                                reviews: rvs,
                                "is_driver": true,
                                "login": (req.session.sid !== undefined),
                                'lang': req.session.lang
                            });

                        });
                    }
                    else { // if driver hasn't a reservation history
                        res.render('driver/history', {
                            records: dt,
                            "is_driver": true,
                            "login": (req.session.sid !== undefined),
                            'lang': req.session.lang
                        });
                    }
                })
            }
        });
    }
}

function add_new_driver_car(req,res) {
    if (req.session.sid === undefined) {
        console.log("You must sign in first");
        res.redirect('/sign_in');
    }
    else {
        dataModel.get_("driver", req.session.sid, function (data) { // check if email exists
            if (data) {
                let car = {};
                for (let field of dataModel.schema_required["car"]) { // dynamically get car keys and values
                    if (field === "driver_id") car[field] = req.session.sid;
                    else car[field] = req.body[field];
                }
                dataModel.check2_("car", `plate = '${car.plate}'`, function (data2) {
                    if (!data2) {
                        const vls = Object.values(car);
                        dataModel.create_("car", vls, function () {
                            console.log("New car added succesfully");
                            res.redirect('/account');
                        });
                    }
                    else {
                        console.log("Car is already in database");
                        res.redirect('/account');
                    }
                });
            }
        });
    }
}

module.exports = {
    change_language,
    get_driver_account_page,
    get_parking_station_account_page,
    update_driver_data,
    update_parking_station_data,
    delete_driver_account,
    delete_parking_station_account,
    get_driver_history_page,
    add_new_driver_car
}