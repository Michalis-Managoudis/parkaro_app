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

function get_user_account_page(req, res) {
    if (req.session.sid === undefined) {
        console.log("To see account page you must sign in first");
        res.redirect('/sign_in');
    }
    else {
        dataModel.get_("user", req.session.sid, function (data) { // check if email exists
            if (data) {
                res.render("user/account", {
                    user: data,
                    'is_user': true,
                    'login': true,
                    'lang': req.session.lang
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
                    parking_station: data,
                    'is_user': false,
                    'login': true,
                    'lang': req.session.lang
                });
            }
        });
    }

}

function update_user_data(req, res) {
    if (req.session.sid === undefined) {
        console.log("important error!");
        res.redirect('/account');
    }
    else {
        let user = {};
        for (let field of dataModel.schema_editable["user"]) user[field] = req.body[field]; // dynamically get user keys and values
        // check fields agree with patterns
        let fields_check = true;
        if (!mail_regex.test(user.email)) fields_check = false;
        if (!password_regex.test(user.password)) fields_check = false;
        if (!phone_regex.test(user.phone)) fields_check = false;
        if (!(user.password===req.body.password2)) fields_check = false;
        //? if (!user.name) fields_check = false;
        if (fields_check) {
            // check if user already exists (email and phone)
            dataModel.check_("user", req.session.sid, "email", user.email, function (bool1) {
                if (bool1) {
                    dataModel.check_("user", req.session.sid, "phone", user.phone, function (bool2) {
                        if (bool2) {
                            user.id = req.session.sid;
                            dataModel.update_("user", user, function () {
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
        for (let field of dataModel.schema_editable["parking_station"]) parking_station[field] = req.body[field]; // dynamically get user keys and values
        // check fields agree with patterns
        let fields_check = true;
        if (!mail_regex.test(parking_station.email)) fields_check = false;
        if (!password_regex.test(parking_station.password)) fields_check = false;
        if (!tin_regex.test(parking_station.tin)) fields_check = false;
        if (!phone_regex.test(parking_station.phone)) fields_check = false;
        if (!(parking_station.lots >= 0)) fields_check = false;
        if (!(parking_station.height > 0)) fields_check = false;
        if (!(parking_station.length > 0)) fields_check = false;
        for (let field of dataModel.schema_parking_station_boolean) {
            if (!(parking_station[field] === 0 || parking_station[field] === 1)) fields_check = false;
        }
        //? if (!parking_station.name) fields_check = false;
        if (fields_check) {
            // check if user already exists (email and phone)
            dataModel.check_("parking_station", "email", parking_station.email, function (bool1) {
                if (bool1) {
                    dataModel.check_("parking_station", "tin", parking_station.tin, function (bool2) {
                        if (bool2) {
                            dataModel.update_("parking_station", parking_station, function () {
                                console.log("Data has been updated succesfully");
                                res.redirect("/parking_station/account");
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

function delete_user_account(req, res) {
    //! alert 
    if (req.session.sid === undefined) {
        console.log("important error!");
        res.redirect('/home');
    }
    else {
        dataModel.delete_("user", req.session.sid, function () {
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
            res.redirect('/parking_station/home');
        });
    }

}

function get_user_history_page(req, res) {
    if (req.session.sid === undefined) {
        console.log("To see history page you must sign in first");
        res.redirect('/sign_in');
    }
    else {
        dataModel.get_("user", req.session.sid, function (data) { // check if email exists
            if (data) {
                dataModel.load_reservation_history("user",req.session.sid, function (data) {
                    const dt = JSON.parse(JSON.stringify(data));
                    if (Object.keys(data).length !== 0) {
                        res.render('user/history', {
                            records: dt,
                            "is_user": true,
                            "login": (req.session.sid !== undefined),
                            'lang': req.session.lang
                        });
                    }
                    else {
                        res.render('user/history', {
                            records: dt,
                            "is_user": true,
                            "login": (req.session.sid !== undefined),
                            'lang': req.session.lang
                        });
                    }
                })
            }
        });
    }
}

module.exports = {
    change_language,
    get_user_account_page,
    get_parking_station_account_page,
    update_user_data,
    update_parking_station_data,
    delete_user_account,
    delete_parking_station_account,
    get_user_history_page
}