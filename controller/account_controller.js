'use strict';
const { data } = require('jquery');
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
    if (req.session.sid === undefined || !req.session.is_driver) {
        console.log("To see account page you must sign in first");
        res.redirect('/sign_in');
    }
    else {
        dataModel.get_("driver", req.session.sid, function (data) { // check if email exists
            if (data) {
                dataModel.read_("car", "plate, model, color", `driver_id=${req.session.sid}`, function (cars1) {
                    dataModel.read_("notification", dataModel.schema_show.notification.join(", "), `user_id = 'd${req.session.sid}'`, function (datan) {
                        datan = JSON.parse(JSON.stringify(datan));
                        let c = 0;
                        for (let el of datan) if (!el.viewed) c++;
                        dataModel.get2_("driver", "points", req.session.sid, function (datap) {
                            res.render("driver/account", {
                                cars: cars1,
                                driver: data,
                                'is_driver': true,
                                'login': true,
                                'lang': req.session.lang,
                                notifications: datan,
                                unread_notification_number: c,
                                points: JSON.stringify(datap.points)
                            });
                        });
                    });
                });
            }
        });
    }

}
function get_parking_station_account_page(req, res) {
    if (req.session.sid === undefined || req.session.is_driver) {
        console.log("To see account page you must sign in first");
        res.redirect('/parking_station/sign_in');
    }
    else {
        dataModel.get_("parking_station", req.session.sid, function (data) { // check if email exists
            if (data) {
                dataModel.read_("notification", dataModel.schema_show.notification.join(", "), `user_id = 'p${req.session.sid}'`, function (datan) {
                    datan = JSON.parse(JSON.stringify(datan));
                    let c = 0;
                    for (let el of datan) if (!el.viewed) c++;
                    data.id = req.session.sid;
                    res.render("parking_station/account", {
                        ps_data: JSON.stringify(data),
                        //ps_data: data,
                        'is_driver': false,
                        'login': true,
                        'lang': req.session.lang,
                        notifications: datan,
                        unread_notification_number: c
                    });
                });
            }
        });
    }

}

function update_driver_data(req, res) {
    if (req.session.sid === undefined || !req.session.is_driver) {
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
        if (!(driver.password === req.body.password2)) fields_check = false;
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
    if (req.session.sid === undefined || req.session.is_driver) {
        console.log("important error!");
        res.redirect('/parking_station/account');
    }
    else {
        let parking_station = {};
        for (let field of dataModel.schema_editable["parking_station"]) {
            if (field == "work_hours") {
                parking_station.work_hours = "";
                if (req.body["work_hours_0"]) parking_station.work_hours = "24/7";
                else {
                    for (let i = 1; i <= 7; i++) {
                        parking_station.work_hours = parking_station.work_hours + req.body["work_hours" + i] + "-" + req.body["work_hours" + i + "b"];
                        if (i !== 7) parking_station.work_hours = parking_station.work_hours + ",";
                    }
                }
            }
            else if (field == "price_list") {
                parking_station.price_list = "h";
                for (let i = 1; i <= 12; i++) {
                    parking_station.price_list = parking_station.price_list + req.body["price_list" + i];
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
        if (!(parking_station.parking_type === 0 || parking_station.parking_type === 1 || parking_station.parking_type === 2)) fields_check = false;
        if (!(parking_station.lots >= 0)) fields_check = false;
        if (!(parking_station.s_height > 0)) fields_check = false;
        if (!(parking_station.s_length > 0)) fields_check = false;
        for (let field of dataModel.schema_parking_station_boolean) {
            parking_station[field] = parseInt(parking_station[field]);
            if (!(parking_station[field] === 0 || parking_station[field] === 1)) fields_check = false;
        }
        if (!(parking_station.password === req.body.password2)) fields_check = false;
        //? if (!parking_station.name) fields_check = false;
        // if (req.body != pass) fields_check = false;
        // else {
        //     console.log("Wrong password");
        //     res.redirect('/parking_station/account');
        // }

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
                                    for (let i = 0; i < diff; i++) {
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
    if (req.session.sid === undefined || !req.session.is_driver) {
        console.log("important error!");
        res.redirect('/home');
    }
    else {
        dataModel.get2_("driver", "email", req.session.sid, function (data) {
            data = JSON.parse(JSON.stringify(data));
            dataModel.auth_("driver", data.email, req.body.password3, function (data2) {
                if (data2) {
                    dataModel.delete_("driver", req.session.sid, function () {
                        req.session.sid = undefined;
                        res.redirect('/home');
                    });
                }
                else {
                    console.log("Wrong password!");
                    res.redirect('/account');
                }
            });
        });
    }
}
function delete_parking_station_account(req, res) {
    //! alert 
    if (req.session.sid === undefined || req.session.is_driver) {
        console.log("important error!");
        res.redirect('/parking_station/home');
    }
    else {
        dataModel.get2_("parking_station", "email", req.session.sid, function (data) {
            data = JSON.parse(JSON.stringify(data));
            dataModel.auth_("parking_station", data.email, req.body.password3, function (data2) {
                if (data2) {
                    dataModel.delete_("parking_station", req.session.sid, function () {
                        req.session.sid = undefined;
                        res.redirect('/parking_station/home');
                    });
                }
                else {
                    console.log("Wrong password!");
                    res.redirect('/parking_station/account');
                }
            });
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
    delete_parking_station_account
}